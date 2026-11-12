// Распознавание FIN с фото Zulassungsbescheinigung Teil II — локально, без внешних сервисов.
//
// OCR: PaddleOCR (PP-OCRv4, ONNX) через @gutenye/ocr-node. Фото обрабатывается в памяти
// и нигде не сохраняется.
//
// Надёжность FIN держится не на OCR, а на проверке: рядом с FIN в поле (3) стоит Prüfziffer.
// Читаем её отдельно и сверяем с вычисленной — совпало, значит FIN прочитана верно.
// Если поле (3) пустое (новые документы), проверяем EU-Prüfziffer на 9-й позиции FIN.
// Ничего не подтвердилось — отдаём FIN как «непроверенную», клиент сверяет её глазами.

import Ocr from '@gutenye/ocr-node';
import sharp from 'sharp';
import { VIN_RE, normalizeVinText, vinCheckDigit, vinHasEuCheckDigit } from '../../shared/vin.js';

// Длинная сторона фото для OCR: первая — основной проход, вторая — если не подтвердилось.
// Больше попыток не делаем: дальше страхует GPT (см. recognize.js).
const LONG_SIDES = [2133, 2900];
const MAX_INPUT_PIXELS = 60_000_000;

let enginePromise = null;
function engine() {
  enginePromise ??= Ocr.create().catch((err) => {
    enginePromise = null;
    throw err;
  });
  return enginePromise;
}

// OCR грузит процессор целиком — обрабатываем фото строго по одному.
let queue = Promise.resolve();
function exclusive(task) {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
}

async function toRaw(image) {
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function rect(box) {
  const xs = box.map((p) => p[0]);
  const ys = box.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  return { x0, x1, y0, y1, h: y1 - y0 };
}

const LABEL_E = /^E$/i;
const SINGLE_CHECK = /^[0-9X]$/;
// Метка самой графы «(3)» — не Prüfziffer, её убираем до поиска одиночной цифры.
const stripFieldLabel = (text) => text.replace(/[(（]\s*3\s*[)）]?|[(（]?\s*3\s*[)）]/g, ' ');

// FIN печатается заглавными, без знаков препинания. Одна строчная — допустимый промах OCR,
// больше — это обычный текст («Haberlandstraße47», «freilegen.Dokument»).
const vinWord = (w) => /^[A-Za-z0-9]+$/.test(w) && (w.match(/[a-z]/g) ?? []).length <= 1;
// ISO 3779: последние знаки FIN — всегда цифры (у мелких производителей — минимум три).
const vinShape = (v) => VIN_RE.test(v) && /\d{3}$/.test(v) && /[A-Z]/.test(v.slice(0, 11));

/** Все 17-значные кандидаты FIN в строках OCR (склеиваем до 3 соседних «слов»). */
function findVins(lines) {
  const found = [];
  for (const line of lines) {
    const words = line.text.split(/[\s()（）:;,]+/).filter(Boolean);
    for (let i = 0; i < words.length; i++) {
      let joined = '';
      for (let j = i; j < Math.min(i + 3, words.length); j++) {
        if (!vinWord(words[j])) break;
        joined += normalizeVinText(words[j]);
        // «EVF32…» — метка поля E прилипла к номеру.
        const candidate = joined.length === 18 && joined[0] === 'E' && j === i ? joined.slice(1) : joined;
        if (candidate.length > 17) break;
        if (candidate.length === 17 && vinShape(candidate)) {
          const labelled = i > 0 && LABEL_E.test(words[i - 1]);
          const tail = words.slice(j + 1);
          // «… (3) 4» — Prüfziffer в той же строке: последнее одиночное 0–9/X справа.
          const inlineCheck = [...tail].reverse().find((w) => SINGLE_CHECK.test(w.toUpperCase()));
          found.push({ vin: candidate, line, labelled, inlineCheck: inlineCheck?.toUpperCase() ?? null });
          break;
        }
      }
    }
  }
  return found;
}

/** Ищем Prüfziffer справа от FIN: сначала среди уже найденных строк, потом отдельным OCR полосы. */
async function readCheckDigit(ocr, raw, hit, lines) {
  if (hit.inlineCheck) return hit.inlineCheck;
  const r = rect(hit.line.box);
  const band = (l) => {
    const o = rect(l.box);
    const cy = (o.y0 + o.y1) / 2;
    return l !== hit.line && o.x0 > r.x1 - r.h && cy > r.y0 - r.h * 0.6 && cy < r.y1 + r.h * 0.6;
  };
  const neighbour = lines.filter(band).sort((a, b) => rect(b.box).x0 - rect(a.box).x0)
    .map((l) => stripFieldLabel(l.text).trim().toUpperCase()).find((t) => SINGLE_CHECK.test(t));
  if (neighbour) return neighbour;

  // Ячейка (3) сразу справа от FIN: «Prüfziffer zur Fahrzeug-Identifizierungsnummer  4».
  // Узкая вырезка (~12 высот строки), ×3 и белые поля — иначе детектор теряет одиночную цифру.
  const left = Math.min(raw.width - 1, Math.max(0, Math.round(r.x1 - r.h * 0.5)));
  const top = Math.min(raw.height - 1, Math.max(0, Math.round(r.y0 - r.h * 0.5)));
  const width = Math.min(raw.width - left, Math.round(r.h * 12));
  const height = Math.min(raw.height - top, Math.round(r.h * 2));
  if (width < 20 || height < 8) return null;
  const crop = sharp(raw.data, { raw: { width: raw.width, height: raw.height, channels: 4 } })
    .extract({ left, top, width, height })
    .resize({ width: width * 3 })
    .extend({ top: 24, bottom: 24, left: 24, right: 24, background: '#ffffff' });
  const { texts } = await ocr.detect(await toRaw(crop));
  const words = texts
    .sort((a, b) => rect(a.box).x0 - rect(b.box).x0)
    .flatMap((t) => stripFieldLabel(t.text).split(/\s+/))
    .map((w) => w.toUpperCase())
    .filter((w) => SINGLE_CHECK.test(w));
  return words.at(-1) ?? null;
}

function verdict(vin, checkRead) {
  const expected = vinCheckDigit(vin);
  if (checkRead && checkRead === expected) return 'pruefziffer';
  if (!checkRead && vinHasEuCheckDigit(vin)) return 'eu';
  return checkRead ? 'mismatch' : 'unverified';
}

// Сколько строк «читается ровно»: горизонтальная рамка, уверенное распознавание, не обрывок.
// У ровного листа ZB II их десятки; боком PaddleOCR склеивает колонки в несколько «строк»,
// вверх ногами — читает мусор с низкой уверенностью.
function uprightScore(texts) {
  return texts.filter((t) => {
    const r = rect(t.box);
    return r.x1 - r.x0 > r.h * 3 && t.mean > 0.85 && t.text.replace(/\s/g, '').length >= 5;
  }).length;
}
const UPRIGHT_ENOUGH = 15;

async function detect(ocr, base, longSide, rotate) {
  let image = base.clone();
  if (rotate) image = image.rotate(rotate);
  const raw = await toRaw(image.resize({ width: longSide, height: longSide, fit: 'inside' }));
  const { texts } = await ocr.detect(raw);
  return { raw, texts };
}

/**
 * Как повернуть фото (по часовой), чтобы лист стоял ровно. Проверяем на уменьшенной копии:
 * сначала как есть, потом боком (частый случай — телефон над столом), потом вверх ногами.
 * Первый поворот, где текст «читается ровно», — ответ; иначе лучший по счёту.
 */
async function findRotation(ocr, base) {
  let best = { rotate: 0, score: -1 };
  for (const rotate of [0, 90, 270, 180]) {
    const { texts } = await detect(ocr, base, 1200, rotate);
    const score = uprightScore(texts);
    if (score >= UPRIGHT_ENOUGH) return rotate;
    if (score > best.score) best = { rotate, score };
  }
  return best.rotate;
}

async function candidates(ocr, { raw, texts }) {
  const hits = findVins(texts);
  // Метка «E» слева — почти наверняка поле E. Без метки — берём все, проверка разберётся.
  hits.sort((a, b) => Number(b.labelled) - Number(a.labelled) || b.line.mean - a.line.mean);
  const results = [];
  for (const [i, hit] of hits.slice(0, 3).entries()) {
    // Дорогой поиск Prüfziffer (доп. OCR вырезки) — только для главного кандидата.
    const check = i === 0 ? await readCheckDigit(ocr, raw, hit, texts) : hit.inlineCheck;
    results.push({ vin: hit.vin, check, status: verdict(hit.vin, check), labelled: hit.labelled });
  }
  return results;
}

/**
 * @param {Buffer} buffer — JPEG/PNG/WebP с фото ZB II
 * @param {{ otherVin?: Promise<string|null>, onRotation?: (deg: number) => void }} [options]
 *   otherVin — FIN, которую параллельно читает другой движок (GPT). Если она совпала с нашей,
 *   второй (тяжёлый) проход не нужен: два независимых прочтения уже согласны.
 *   onRotation — сообщается сразу, как только понятна ориентация листа (до чтения FIN),
 *   чтобы GPT мог заново прочитать повёрнутое фото параллельно.
 * @returns {Promise<{ vin: string|null, status: 'pruefziffer'|'eu'|'unverified'|'not_found',
 *   checkRead: string|null, rotation: number, ms: number, candidates: string[] }>}
 *   checkRead — Prüfziffer, которую OCR прочитал в поле (3) (может быть и ошибочной);
 *   rotation — на сколько градусов (по часовой) повернуть фото, чтобы лист стоял ровно.
 */
export function recognizeZb2(buffer, { otherVin, onRotation } = {}) {
  return exclusive(async () => {
    const started = Date.now();
    const ocr = await engine();
    const base = sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS }).rotate(); // EXIF-поворот
    await base.metadata(); // битый файл — ошибка сразу

    const all = [];
    let rotation = 0;
    const done = (r) => ({
      vin: r?.vin ?? null,
      status: r ? (r.status === 'mismatch' ? 'unverified' : r.status) : 'not_found',
      checkRead: r?.check ?? null,
      rotation,
      ms: Date.now() - started,
      // Для отладки/логов, клиенту не отдаётся.
      candidates: all.map((c) => `${c.vin}${c.labelled ? '[E]' : ''}:${c.check ?? '-'}:${c.status}`),
    });
    const confirmed = () => all.find((r) => r.status === 'pruefziffer' || r.status === 'eu');

    // Сначала ориентация (быстро, на маленькой копии), потом проход 1 по ровному листу.
    rotation = await findRotation(ocr, base);
    onRotation?.(rotation);
    all.push(...(await candidates(ocr, await detect(ocr, base, LONG_SIDES[0], rotation))));
    if (confirmed()) return done(confirmed());

    // Другой движок прочитал ту же FIN — второй проход не нужен.
    const other = otherVin ? await otherVin.catch(() => null) : null;
    const agreed = other && all.find((r) => r.vin === other);
    if (agreed) return done(agreed);

    // Проход 2: крупнее.
    all.push(...(await candidates(ocr, await detect(ocr, base, LONG_SIDES[1], rotation))));
    if (confirmed()) return done(confirmed());
    if (all.length === 0) return done(null);

    // Не подтвердилось: берём FIN, которую OCR чаще всего видел (с меткой E — в приоритете).
    const votes = new Map();
    for (const r of all) votes.set(r.vin, (votes.get(r.vin) ?? 0) + 1 + (r.labelled ? 2 : 0));
    const best = [...votes.entries()].sort((a, b) => b[1] - a[1])[0][0];
    return done(all.find((r) => r.vin === best));
  });
}

/** Прогреть модель при старте сервера, чтобы первый клиент не ждал загрузки. */
export function warmUpOcr() {
  return engine();
}
