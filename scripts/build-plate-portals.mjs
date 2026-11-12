// Пересобирает shared/plate-portals.json: код на номере (LÜN, DO, M …) → ссылка на
// портал снятия с учёта. Коды берём из списка Kfz-Kennzeichen (Википедия), ссылки — из
// server/portals/*.json. Запуск: node scripts/build-plate-portals.mjs
//
// Запускать заново после пополнения server/portals/*.json новыми порталами.

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const portals = (f) => JSON.parse(readFileSync(path.join(ROOT, 'server/portals', f), 'utf8')).portals;
const i4 = portals('i4.json');
const akdb = portals('akdb.json');
const efa = portals('efa.json');

const WIKI = 'https://de.wikipedia.org/w/index.php?title=Liste_der_Kfz-Kennzeichen_in_Deutschland&action=raw';
const res = await fetch(WIKI, { headers: { 'user-agent': 'AutoAbmeldung build script' } });
if (!res.ok) throw new Error(`Wikipedia ${res.status}`);
const wiki = (await res.text()).split('\n');

const strip = (s) => s.replace(/\[\[([^\]|]+)(\|[^\]]*)?\]\]/g, '$1').replace(/'''/g, '').replace(/<[^>]+>/g, '').trim();

function key(nameRaw, slug) {
  let n = strip(nameRaw);
  let type = '';
  if (/_stadt$/.test(slug || '') || /\(Stadt\)|^Stadt |Landeshauptstadt|Hansestadt|kreisfreie Stadt/i.test(n)) type = 'stadt';
  if (/_kreis$|_staedteregion$/.test(slug || '') || /Landkreis|^Kreis |Städteregion|Regionalverband|,\s*(LK|Kreis)|\(Kreis\)/i.test(n)) type = 'kreis';
  n = n
    .replace(/,?\s*(Landkreis|Landeshauptstadt|Hansestadt|Städteregion|Regionalverband|kreisfreie Stadt)\b/gi, '')
    .replace(/^(Stadt|Kreis|LK)\s+/i, '').replace(/,\s*(Stadt|Kreis|LK|Städteregion)$/i, '')
    .replace(/\s*\((Stadt|Landkreis|Kreis|Saale|Oder|Westf\.?|Wümme|[^)]*)\)/gi, '')
    .replace(/\bim\b|\ban der\b|\bam\b|\/.*$/gi, '')
    .toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '').trim();
  return { core: n, type };
}

const index = new Map();
const add = (name, slug, url) => {
  const k = key(name, slug);
  for (const t of k.type ? [k.type] : ['stadt', 'kreis']) {
    const kk = k.core + '|' + t;
    if (!index.has(kk)) index.set(kk, { url, name: strip(name) });
  }
};
for (const p of i4) add(p.name, p.id, p.url);
for (const p of akdb) add(p.name, '', p.url);
for (const p of efa) add(p.name, '', p.url);

const codeCellRe = /^\|\s*(?:rowspan="\d+"\s*\|\s*)?'''(.+?)'''\s*$/;
const codes = [];
for (let i = 0; i < wiki.length; i++) {
  const m = codeCellRe.exec(wiki[i]);
  if (!m) continue;
  let codeTxt = m[1];
  const link = codeTxt.match(/\|([A-ZÄÖÜ]{1,3})\]\]/) || codeTxt.match(/\[\[([A-ZÄÖÜ]{1,3})\]\]/);
  if (link) codeTxt = link[1];
  const codeVal = codeTxt.replace(/[^A-ZÄÖÜ]/g, '');
  if (!codeVal || codeVal.length > 3) continue;
  for (let j = i + 1; j < Math.min(i + 5, wiki.length); j++) {
    if (codeCellRe.test(wiki[j])) break;
    if (wiki[j].includes('[[') && !wiki[j].includes("'''")) {
      codes.push({ code: codeVal, region: strip(wiki[j].replace(/^\|\s*(rowspan="\d+"\s*\|\s*)?/, '')) });
      break;
    }
  }
}

const map = {};
for (const c of codes) {
  if (map[c.code]) continue;
  const stadtHint = !/Landkreis|^Kreis |Städteregion|Regionalverband/i.test(c.region);
  const k = key(c.region, '');
  const tryTypes = k.type ? [k.type] : (stadtHint ? ['stadt', 'kreis'] : ['kreis', 'stadt']);
  for (const t of tryTypes) {
    const hit = index.get(k.core + '|' + t);
    if (hit) { map[c.code] = { url: hit.url, authority: hit.name }; break; }
  }
}

const sorted = {};
for (const k of Object.keys(map).sort()) sorted[k] = map[k];
writeFileSync(path.join(ROOT, 'shared/plate-portals.json'), JSON.stringify(sorted, null, 2) + '\n');
console.log(`plate-portals.json: ${Object.keys(sorted).length} Kennzeichen (von ${codes.length}) auf ${i4.length + akdb.length + efa.length} Portale`);
