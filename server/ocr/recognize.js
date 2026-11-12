// Фото ZB II → данные для формы.
//
// FIN: сначала локальный PaddleOCR. GPT читает параллельно и страхует:
//   1) FIN от Paddle сошлась с Prüfziffer (прочитанной любым из движков) → verified;
//   2) Paddle и GPT независимо прочитали одинаковую FIN → verified;
//   3) Paddle не справился, а FIN от GPT сошлась с Prüfziffer → verified;
//   4) иначе отдаём лучшую догадку со статусом check — клиент сверяет её с документом.
// Владелец и номер: только из GPT (колонка с самой поздней датой); всё, что не проходит
// нашу же валидацию формы, отбрасываем — лучше пустое поле, чем неверное.

import sharp from 'sharp';
import { recognizeZb2 } from './zb2.js';
import { gptEnabled, readWithGpt } from './gpt.js';
import { VIN_RE, normalizeVinText, vinCheckDigit, vinHasEuCheckDigit } from '../../shared/vin.js';
import { normalize, validateField } from '../../shared/validation.js';

const PLATE_RE = /^([A-ZÄÖÜ]{1,3})[\s:-]+([A-Z]{1,2})[\s-]*(\d{1,4}[EH]?)$/;

function parsePlate(text) {
  const m = String(text ?? '').toUpperCase().replace(/\*/g, ' ').replace(/\s+/g, ' ').trim().match(PLATE_RE);
  if (!m) return null;
  const plate = { plateDistrict: m[1], plateLetters: m[2], plateNumber: m[3] };
  const ok = Object.entries(plate).every(([k, v]) => !validateField(k, v, plate));
  return ok ? plate : null;
}

function parseDate(text) {
  const m = String(text ?? '').match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!m) return null;
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1950) return null;
  const t = Date.UTC(y, mo - 1, d);
  return t > Date.now() + 86_400_000 ? null : t;
}

/**
 * Текущий владелец = колонка с самой поздней датой в строке I.
 * Даты не читаются или совпадают — не знаем, кто текущий, и ничего не подставляем.
 */
function latestHolder(holders = []) {
  const filled = holders.filter((h) => h.lastName || h.firstName || h.street || h.plate);
  if (filled.length <= 1) return filled[0] ?? null;
  const dated = filled.map((h) => ({ h, t: parseDate(h.date) }));
  if (dated.some((d) => d.t === null)) return null;
  dated.sort((a, b) => b.t - a.t);
  return dated[0].t === dated[1].t ? null : dated[0].h;
}

function pickHolder(g) {
  if (!g || g.documentType === 'other') return {};
  const h = latestHolder(g.holders);
  if (!h) return {};
  const values = normalize({ lastName: h.lastName, firstName: h.firstName, street: h.street, zip: h.zip, city: h.city });
  const holder = {};
  for (const key of ['lastName', 'firstName', 'street', 'zip', 'city']) {
    if (values[key] && !validateField(key, values[key], values)) holder[key] = values[key];
  }
  return { ...holder, ...(parsePlate(h.plate) ?? {}) };
}

function decideVin(local, g) {
  const p = local?.vin ?? null;
  const gv = g ? normalizeVinText(g.vin) : '';
  const gVin = VIN_RE.test(gv) ? gv : null;
  const checks = new Set(
    [local?.checkRead, g?.vinCheckDigit?.trim().toUpperCase()].filter((c) => /^[0-9X]$/.test(c ?? '')),
  );
  const confirmed = (v) => Boolean(v) && (checks.has(vinCheckDigit(v)) || (checks.size === 0 && vinHasEuCheckDigit(v)));

  if (confirmed(p)) return { value: p, status: 'verified', by: 'paddle+pruefziffer' };
  if (p && p === gVin) return { value: p, status: 'verified', by: 'paddle+gpt' };
  if (local?.status === 'pruefziffer' || local?.status === 'eu') return { value: p, status: 'verified', by: `paddle+${local.status}` };
  if (confirmed(gVin)) return { value: gVin, status: 'verified', by: 'gpt+pruefziffer' };
  if (p) return { value: p, status: 'check', by: 'paddle' };
  if (gVin) return { value: gVin, status: 'check', by: 'gpt' };
  return { value: null, status: 'not_found', by: null };
}

/**
 * @param {Buffer} buffer — фото от клиента (JPEG/PNG/WebP/HEIC — что понимает sharp)
 */
export async function recognizeDocument(buffer) {
  const started = Date.now();
  // Один раз: EXIF-поворот и разумный размер. Для GPT короткая сторона ~1600 px.
  // Один раз выпрямляем по EXIF и фиксируем: второй .rotate() в sharp заменяет первый,
  // и EXIF-поворот потерялся бы при повороте листа. Битый файл — ошибка здесь, до движков.
  // Важно: необработанный reject где-либо роняет весь сервер (OpenCV делает abort).
  buffer = await sharp(buffer, { limitInputPixels: 60_000_000 }).rotate().jpeg({ quality: 92 }).toBuffer();
  const image = sharp(buffer);
  const gptImage = (rotation = 0) => image.clone()
    .rotate(rotation)
    .resize({ width: 1600, height: 1600, fit: 'outside', withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toBuffer();
  const timed = async (fn) => { const t = Date.now(); const v = await fn(); return { v, ms: Date.now() - t }; };

  // Параллельно: Paddle (FIN) и GPT (владелец + второе мнение по FIN).
  const useGpt = gptEnabled();
  const gptTask = useGpt ? timed(async () => readWithGpt(await gptImage())) : Promise.resolve({ v: null, ms: 0 });
  gptTask.catch(() => {}); // обработчик сразу — см. выше про abort

  // Лист на фото боком или вверх ногами — GPT на таком фото путает колонки владельцев.
  // Paddle первым делом определяет ориентацию; если лист повёрнут, сразу запускаем
  // второе чтение GPT с ровным листом и дальше верим ему.
  let rotatedTask = null;
  let rotationKnown;
  const rotationReady = new Promise((resolve) => { rotationKnown = resolve; });
  const onRotation = (deg) => {
    if (deg && useGpt) {
      rotatedTask = timed(async () => readWithGpt(await gptImage(deg)));
      rotatedTask.catch(() => {});
    }
    rotationKnown();
  };
  // FIN от GPT для Paddle: совпали — его второй (тяжёлый) проход не нужен.
  const otherVin = (async () => {
    await rotationReady;
    const r = await (rotatedTask ?? gptTask);
    return r?.v ? normalizeVinText(r.v.vin) : null;
  })();
  otherVin.catch(() => {});

  const localRes = await Promise.allSettled([timed(() => recognizeZb2(buffer, { otherVin, onRotation }))]).then((r) => r[0]);
  rotationKnown(); // если Paddle упал раньше, чем определил ориентацию
  const [gptRes] = await Promise.allSettled([rotatedTask ?? gptTask]);

  const local = localRes.status === 'fulfilled' ? localRes.value.v : null;
  const g = gptRes.status === 'fulfilled' ? gptRes.value.v : null;
  if (localRes.status === 'rejected') console.error('[ocr] paddle:', localRes.reason?.message ?? localRes.reason);
  if (gptRes.status === 'rejected') console.error('[ocr] gpt:', gptRes.reason?.message ?? gptRes.reason);
  if (localRes.status === 'rejected' && (gptRes.status === 'rejected' || !useGpt)) {
    throw localRes.reason;
  }

  const vin = decideVin(local, g);
  const fields = pickHolder(g);
  const documentType = g?.documentType ?? (local?.vin ? 'zb' : 'other');

  // В лог — только служебное, без персональных данных.
  const ms = (r) => (r.status === 'fulfilled' ? r.value.ms : 'err');
  console.log(
    `[ocr] ${Date.now() - started}ms (paddle ${ms(localRes)}, gpt ${ms(gptRes)}${rotatedTask ? `, gedreht ${local?.rotation}°` : ''})`
    + ` vin=${vin.status}/${vin.by ?? '-'} doc=${documentType} fields=${Object.keys(fields).length}`,
  );
  // jpeg — выпрямленное фото: сервер подержит его в памяти до отправки заявки (Telegram).
  return { documentType, vin: { value: vin.value, status: vin.status }, fields, jpeg: buffer };
}
