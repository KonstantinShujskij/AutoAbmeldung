// Общие подписи для уведомлений о заявке.

import { formatPlate } from '../../shared/validation.js';

export const VERBLEIB_RU = {
  abmelden: 'только снять с учёта',
  verwertet: 'утилизирована (Verwertungsnachweis, ЕС)',
  ausland: 'утилизация вне ЕС',
};

export const VERBLEIB_DE = {
  abmelden: 'Nur abmelden',
  verwertet: 'Verschrottet (Verwertungsnachweis)',
  ausland: 'Entsorgung außerhalb der EU',
};

export const plateOf = (d) => formatPlate(d);

/** 2026-11-01 → 01.11.2026 */
export function dateDe(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '');
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso ?? '';
}

export function dateTimeDe(iso) {
  return new Date(iso).toLocaleString('de-DE', {
    timeZone: 'Europe/Berlin',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
