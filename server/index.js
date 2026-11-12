import express from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateApplication } from '../shared/validation.js';
import { PRIVACY_VERSION } from '../shared/legal.js';
import { recognizeDocument } from './ocr/recognize.js';
import { warmUpOcr } from './ocr/zb2.js';
import { keepScan, takeScan } from './scans.js';
import { handleUpdate, sendToTelegram, setupWebhook, telegramEnabled, webhookSecret } from './notify/telegram.js';
import { mailEnabled, sendConfirmation, sendPaymentRequest } from './notify/mail.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'server', 'data', 'applications');
const DIST_DIR = path.join(ROOT, 'dist');
// Отдельная переменная: общий PORT часто выставляют для dev-сервера фронтенда.
const PORT = Number(process.env.API_PORT) || 3001;
// Тестовый стенд: SITE_AUTH="логин:пароль" закрывает весь сайт Basic-авторизацией,
// NOINDEX=1 просит поисковики не индексировать. На боевом домене обе не задаются.
const SITE_AUTH = process.env.SITE_AUTH || '';
const NOINDEX = process.env.NOINDEX === '1';

// Номер заявки без похожих символов (0/O, 1/I/L), чтобы его можно было продиктовать.
const ID_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
function makeId() {
  const bytes = randomBytes(6);
  const tail = Array.from(bytes, (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join('');
  return `AF-${new Date().getFullYear()}-${tail}`;
}

function basicAuth(credentials) {
  const expected = Buffer.from(credentials, 'utf8');
  return (req, res, next) => {
    const [scheme, encoded] = (req.headers.authorization || '').split(' ');
    const given = scheme === 'Basic' && encoded ? Buffer.from(encoded, 'base64') : Buffer.alloc(0);
    if (given.length === expected.length && timingSafeEqual(given, expected)) return next();
    res.set('WWW-Authenticate', 'Basic realm="AutoFaren Test", charset="UTF-8"');
    res.status(401).type('text/plain').send('Testumgebung – Zugang nur mit Passwort.');
  };
}

// Распознавание грузит процессор и тратит деньги на OpenAI — ограничиваем частоту с одного адреса.
function rateLimit({ max, windowMs }) {
  const hits = new Map();
  return (req, res, next) => {
    const ip = req.headers['cf-connecting-ip'] || req.ip;
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      return res.status(429).json({ error: 'Zu viele Versuche. Bitte in ein paar Minuten erneut.' });
    }
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) hits.clear();
    next();
  };
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const app = express();
app.disable('x-powered-by');

// Для проверки живости (Docker healthcheck, деплой) — без пароля и без данных.
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Нажатия кнопок в Telegram. Доступ — только с секретным заголовком, который знает Telegram.
app.post('/api/telegram/webhook', express.json({ limit: '64kb' }), (req, res) => {
  if (!telegramEnabled() || req.get('x-telegram-bot-api-secret-token') !== webhookSecret()) {
    return res.sendStatus(401);
  }
  res.sendStatus(200); // отвечаем сразу, работу делаем после
  handleUpdate(req.body, { onInvoice: requestPayment }).catch((err) => console.error('[telegram]', err.message));
});

if (NOINDEX) {
  app.use((req, res, next) => {
    res.set('X-Robots-Tag', 'noindex, nofollow');
    next();
  });
  app.get('/robots.txt', (req, res) => res.type('text/plain').send('User-agent: *\nDisallow: /\n'));
}

if (SITE_AUTH) app.use(basicAuth(SITE_AUTH));

app.use(express.json({ limit: '32kb' }));

// Фото ZB II → FIN и данные владельца. Фото обрабатывается в памяти и не сохраняется.
app.post(
  '/api/recognize',
  rateLimit({ max: 15, windowMs: 10 * 60_000 }),
  express.raw({ type: IMAGE_TYPES, limit: '15mb' }),
  async (req, res, next) => {
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(415).json({ error: 'Bitte ein Foto (JPEG, PNG oder WebP) senden.' });
    }
    try {
      const { jpeg, ...result } = await recognizeDocument(req.body);
      // Фото держим в памяти до отправки заявки, чтобы приложить его в Telegram.
      const scanId = keepScan(jpeg, { vin: result.vin.value, vinStatus: result.vin.status });
      res.json({ ...result, scanId });
    } catch (err) {
      if (/Input buffer|unsupported image format|bad seek|corrupt/i.test(err.message)) {
        return res.status(422).json({ error: 'Das Foto konnte nicht gelesen werden. Bitte ein anderes versuchen.' });
      }
      next(err);
    }
  },
);

app.post('/api/applications', async (req, res, next) => {
  try {
    const { values, errors } = validateApplication(req.body ?? {});
    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ errors });
    }

    const createdAt = new Date().toISOString();
    const { privacyAccepted, ...data } = values;
    const record = {
      id: makeId(),
      status: 'eingegangen',
      createdAt,
      data,
      // Подтверждение Datenschutzhinweise: когда и какую версию текста клиент видел.
      privacy: { acknowledged: privacyAccepted, at: createdAt, version: PRIVACY_VERSION },
    };
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(path.join(DATA_DIR, `${record.id}.json`), JSON.stringify(record, null, 2), 'utf8');

    res.status(201).json({ id: record.id, status: record.status, createdAt: record.createdAt });
    // Уведомления — после ответа клиенту: их сбой не должен ломать отправку заявки.
    notifyNewApplication(record, req.body?.scanId);
  } catch (err) {
    next(err);
  }
});

const ID_RE = /^AF-\d{4}-[A-Z0-9]{6}$/;
const recordPath = (id) => path.join(DATA_DIR, `${id}.json`);

async function loadRecord(id) {
  if (!ID_RE.test(id)) return null;
  try {
    return JSON.parse(await readFile(recordPath(id), 'utf8'));
  } catch {
    return null;
  }
}

const saveRecord = (record) => writeFile(recordPath(record.id), JSON.stringify(record, null, 2), 'utf8');

// Кнопка «отправить счёт» в Telegram: письмо с оплатой клиенту + отметка в заявке.
const paymentInFlight = new Set();
async function requestPayment(id, operator) {
  const record = await loadRecord(id);
  if (!record) return { status: 'error', message: `заявка ${id} не найдена` };
  if (record.payment?.requestedAt) {
    return { status: 'already', at: record.payment.requestedAt, by: record.payment.requestedBy };
  }
  if (!mailEnabled()) return { status: 'error', message: 'почта (SMTP) ещё не настроена' };
  if (paymentInFlight.has(id)) return { status: 'error', message: 'уже отправляется, подождите' };
  paymentInFlight.add(id);
  try {
    await sendPaymentRequest(record);
    const at = new Date().toISOString();
    record.status = 'zahlung_angefordert';
    record.payment = { ...(record.payment ?? {}), requestedAt: at, requestedBy: operator };
    await saveRecord(record);
    console.log(`[payment] ${id} Zahlungsaufforderung gesendet (${operator})`);
    return { status: 'sent', at, by: operator };
  } finally {
    paymentInFlight.delete(id);
  }
}

async function notifyNewApplication(record, scanId) {
  const scan = takeScan(scanId);
  const vinFromScan = scan && scan.meta.vin === record.data.vin ? scan.meta.vinStatus : undefined;
  const jobs = [];
  if (telegramEnabled()) jobs.push(['telegram', sendToTelegram(record, { jpeg: scan?.jpeg, vinFromScan })]);
  if (mailEnabled()) jobs.push(['mail', sendConfirmation(record)]);
  const results = await Promise.allSettled(jobs.map(([, p]) => p));
  const summary = jobs.map(([name], i) => `${name}=${results[i].status === 'fulfilled' ? 'ok' : 'FEHLER'}`);
  console.log(`[notify] ${record.id} ${summary.join(' ') || 'keine Kanäle konfiguriert'}${scan ? ' +foto' : ''}`);
  results.forEach((r, i) => r.status === 'rejected' && console.error(`[notify] ${jobs[i][0]}:`, r.reason?.message ?? r.reason));
}

// Продакшен: отдаём собранный фронтенд.
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.use((err, req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Ungültige Anfrage.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Die Datei ist zu groß.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Interner Fehler. Bitte später erneut versuchen.' });
});

app.listen(PORT, () => {
  const flags = [
    SITE_AUTH && 'Passwortschutz',
    NOINDEX && 'noindex',
    process.env.OPENAI_API_KEY ? `OCR+${process.env.OPENAI_MODEL || 'gpt-5.4-mini'}` : 'OCR lokal',
    telegramEnabled() ? 'Telegram' : 'ohne Telegram',
    mailEnabled() ? 'E-Mail' : 'ohne E-Mail',
  ].filter(Boolean);
  console.log(`AutoFaren API läuft auf http://localhost:${PORT}${flags.length ? ` (${flags.join(', ')})` : ''}`);
  // Модель OCR грузится ~1–2 с — заранее, чтобы первый клиент не ждал.
  // Нажатия кнопок Telegram приходят на публичный адрес — регистрируем его при старте.
  if (telegramEnabled() && process.env.PUBLIC_URL) {
    setupWebhook(process.env.PUBLIC_URL)
      .then(() => console.log('[telegram] Webhook aktiv'))
      .catch((err) => console.error('[telegram] Webhook:', err.message));
  }
  warmUpOcr()
    .then(() => {
      // OpenCV (внутри OCR) вешает process.on('unhandledRejection', abort) — любая забытая
      // ошибка где угодно убила бы весь сервер. Заменяем на запись в лог.
      process.removeAllListeners('unhandledRejection');
      process.on('unhandledRejection', (err) => console.error('[unhandledRejection]', err));
    })
    .catch((err) => console.error('[ocr] Modell konnte nicht geladen werden:', err.message));
});
