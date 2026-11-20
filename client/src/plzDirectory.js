// Справочник немецких PLZ↔Ort (GeoNames, очищен от Großempfänger-индексов).
// Данные (~400 КБ) грузятся лениво — только когда пользователь впервые трогает
// поле адреса, одним динамическим import'ом (Vite выносит его в отдельный чанк).

let promise = null;

/** Загружает и индексирует справочник один раз; повторные вызовы возвращают тот же промис. */
export function loadPlzDirectory() {
  if (!promise) {
    promise = import('./data/plz-de.json')
      .then((m) => build(m.default))
      .catch((e) => {
        promise = null; // дать шанс повторной попытке при следующем фокусе
        throw e;
      });
  }
  return promise;
}

// Нормализация для поиска: регистр, умлауты (ä→ae, ü→ue, ö→oe, ß→ss),
// остальные диакритики снимаем, не-буквы схлопываем в пробел. Так совпадают
// и «München», и «Muenchen»; слова разделены пробелом для поиска по началу слова.
const norm = (s) =>
  s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const LIMIT = 7;

function build({ byPlz }) {
  const pairs = []; // { plz, ort } — порядок по возрастанию PLZ (ключи уже отсортированы)
  const ortMap = new Map(); // название → [plz, …]
  for (const plz of Object.keys(byPlz)) {
    for (const ort of byPlz[plz]) {
      pairs.push({ plz, ort });
      let list = ortMap.get(ort);
      if (!list) ortMap.set(ort, (list = []));
      list.push(plz);
    }
  }
  const orts = [...ortMap.entries()]
    .map(([name, plzs]) => ({ name, plzs: plzs.sort(), norm: norm(name) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'de'));

  // Поиск по индексу: показываем конкретные пары «PLZ · Ort».
  function searchPlz(q) {
    const digits = (q || '').replace(/\D/g, '');
    if (digits.length < 2) return [];
    const out = [];
    for (const p of pairs) {
      if (p.plz.startsWith(digits)) {
        out.push({ zip: p.plz, city: p.ort, label: p.plz, sub: p.ort });
        if (out.length >= LIMIT) break;
      } else if (out.length && p.plz.slice(0, digits.length) > digits) {
        break; // пары отсортированы — диапазон префикса пройден
      }
    }
    return out;
  }

  // Поиск по названию: сперва совпадения с начала, затем с начала любого слова.
  function searchOrt(q) {
    const n = norm(q || '');
    if (n.length < 2) return [];
    const starts = [];
    const words = [];
    for (const o of orts) {
      if (o.norm.startsWith(n)) starts.push(o);
      else if ((' ' + o.norm).includes(' ' + n)) words.push(o);
      if (starts.length >= LIMIT) break;
    }
    return [...starts, ...words].slice(0, LIMIT).map((o) => ({
      city: o.name,
      zip: o.plzs.length === 1 ? o.plzs[0] : null,
      label: o.name,
      sub: o.plzs.length === 1 ? o.plzs[0] : `${o.plzs.length} PLZ`,
      many: o.plzs.length > 1,
    }));
  }

  return { searchPlz, searchOrt };
}
