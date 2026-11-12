import express from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateApplication } from '../shared/validation.js';
import { PRIVACY_VERSION } from '../shared/legal.js';

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

const app = express();
app.disable('x-powered-by');

// Для проверки живости (Docker healthcheck, деплой) — без пароля и без данных.
app.get('/api/health', (req, res) => res.json({ ok: true }));

if (NOINDEX) {
  app.use((req, res, next) => {
    res.set('X-Robots-Tag', 'noindex, nofollow');
    next();
  });
  app.get('/robots.txt', (req, res) => res.type('text/plain').send('User-agent: *\nDisallow: /\n'));
}

if (SITE_AUTH) app.use(basicAuth(SITE_AUTH));

app.use(express.json({ limit: '32kb' }));

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
  } catch (err) {
    next(err);
  }
});

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
  console.error(err);
  res.status(500).json({ error: 'Interner Fehler. Bitte später erneut versuchen.' });
});

app.listen(PORT, () => {
  const flags = [SITE_AUTH && 'Passwortschutz', NOINDEX && 'noindex'].filter(Boolean);
  console.log(`AutoFaren API läuft auf http://localhost:${PORT}${flags.length ? ` (${flags.join(', ')})` : ''}`);
});
