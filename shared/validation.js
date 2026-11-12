// Общие правила валидации — используются и во фронтенде, и на сервере.
// Сообщения на немецком: их видит клиент.

/**
 * Защитные коды: длина и обязательность.
 * Код ZB II (12 знаков, FZV Anlage 8) для обычной Außerbetriebsetzung не нужен — только
 * при утилизации (Verbleib «verwertet»/«ausland»): тогда портал требует и его.
 */
export const CODE_RULES = {
  codeZb1: { length: 7, required: true }, // Zulassungsbescheinigung Teil I, Rückseite
  codeZb2: { length: 12, required: false }, // Zulassungsbescheinigung Teil II — nur bei Verwertung
  codeFront: { length: 3, required: true }, // Stempelplakette vorne
  codeBack: { length: 3, required: true }, // Stempelplakette hinten
};

/**
 * «Verbleib des Fahrzeugs» — три варианта портала i-Kfz (Stufe 4):
 *  abmelden  — только снять с учёта, машина остаётся (можно зарезервировать номер);
 *  verwertet — утилизирована в Германии/ЕС, есть Verwertungsnachweis;
 *  ausland   — увезена на утилизацию за пределы ЕС/ЕЭЗ.
 */
export const VERBLEIB = ['abmelden', 'verwertet', 'ausland'];
export const needsDisposal = (verbleib) => verbleib === 'verwertet' || verbleib === 'ausland';

export const FIELDS = [
  'email',
  'lastName',
  'firstName',
  'street',
  'zip',
  'city',
  'vin',
  'plateDistrict',
  'plateLetters',
  'plateNumber',
  'verbleib',
  'reservieren', // boolean: Kennzeichen reservieren (nur bei «abmelden»)
  'verwertungDatum', // YYYY-MM-DD
  'verwertungStaat',
  'demontageNr', // Betriebsnummer des Demontagebetriebs (nur «verwertet»)
  'codeZb1',
  'codeZb2',
  'codeFront',
  'codeBack',
  'privacyAccepted', // галочка «Datenschutzhinweise zur Kenntnis genommen» (boolean)
];

export const SECTIONS = [
  { id: 'kontakt', fields: ['email'] },
  { id: 'halter', fields: ['lastName', 'firstName', 'street', 'zip', 'city'] },
  {
    id: 'fahrzeug',
    fields: ['vin', 'plateDistrict', 'plateLetters', 'plateNumber', 'verbleib', 'verwertungDatum', 'verwertungStaat', 'demontageNr'],
  },
  { id: 'codes', fields: ['codeZb1', 'codeZb2', 'codeFront', 'codeBack'] },
];

// Галочка по умолчанию НЕ отмечена (EuGH «Planet49»: заранее поставленные галочки недопустимы).
// Verbleib по умолчанию «abmelden» — самый частый случай; резервирование номера выключено.
export const EMPTY_FORM = {
  ...Object.fromEntries(FIELDS.map((f) => [f, ''])),
  verbleib: 'abmelden',
  reservieren: false,
  privacyAccepted: false,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^\p{L}[\p{L}\p{M}' .,-]*$/u;
// Ortsnamen: «Fröndenberg/Ruhr», «Frankfurt (Oder)», «St. Ingbert», «Neustadt a. d. Aisch».
const CITY_RE = /^\p{L}[\p{L}\p{M}' .,()/-]*$/u;
const ZIP_RE = /^\d{5}$/;
const VIN_ALLOWED_RE = /^[A-HJ-NPR-Z0-9]*$/; // ISO 3779: ohne I, O, Q
const PLATE_DISTRICT_RE = /^[A-ZÄÖÜ]{1,3}$/;
const PLATE_LETTERS_RE = /^[A-Z]{1,2}$/;
const PLATE_NUMBER_RE = /^[1-9]\d{0,3}[EH]?$/;
const CODE_CHARS_RE = /^[A-Za-z0-9]*$/;

const squash = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const compact = (s) => String(s ?? '').replace(/[\s-]+/g, '');

// Поля, которые не относятся к выбранному Verbleib, обнуляем — чтобы в заявку не попало
// ничего лишнего (например, код ZB II при обычном снятии с учёта).
function normalizeVerbleib(raw) {
  const verbleib = VERBLEIB.includes(raw.verbleib) ? raw.verbleib : '';
  const disposal = needsDisposal(verbleib);
  return {
    verbleib,
    reservieren: verbleib === 'abmelden' && raw.reservieren === true,
    verwertungDatum: disposal ? String(raw.verwertungDatum ?? '').trim() : '',
    verwertungStaat: disposal ? squash(raw.verwertungStaat) : '',
    demontageNr: verbleib === 'verwertet' ? squash(raw.demontageNr).toUpperCase() : '',
    codeZb2: disposal ? compact(raw.codeZb2) : '',
  };
}

/** Приводит ввод к каноническому виду (без изменения регистра в кодах!). */
export function normalize(raw = {}) {
  return {
    email: squash(raw.email).toLowerCase(),
    lastName: squash(raw.lastName),
    firstName: squash(raw.firstName),
    street: squash(raw.street),
    zip: compact(raw.zip),
    city: squash(raw.city),
    vin: compact(raw.vin).toUpperCase(),
    plateDistrict: compact(raw.plateDistrict).toUpperCase(),
    plateLetters: compact(raw.plateLetters).toUpperCase(),
    plateNumber: compact(raw.plateNumber).toUpperCase(),
    privacyAccepted: raw.privacyAccepted === true,
    ...normalizeVerbleib(raw),
    codeZb1: compact(raw.codeZb1),
    codeFront: compact(raw.codeFront),
    codeBack: compact(raw.codeBack),
  };
}

function checkCode(value, { length, required }) {
  if (!value) return required ? 'Pflichtfeld.' : null;
  if (!CODE_CHARS_RE.test(value)) return 'Nur Buchstaben und Ziffern.';
  if (value.length !== length) return `Der Code hat genau ${length} Zeichen (jetzt ${value.length}).`;
  return null;
}

/** Проверка одного поля. Возвращает текст ошибки или null. */
export function validateField(name, v, all = {}) {
  switch (name) {
    case 'email':
      if (!v) return 'Pflichtfeld.';
      return EMAIL_RE.test(v) ? null : 'Bitte eine gültige E-Mail-Adresse eingeben.';
    case 'lastName':
    case 'firstName':
      if (!v) return 'Pflichtfeld.';
      return NAME_RE.test(v) ? null : 'Nur Buchstaben, Leerzeichen und Bindestriche.';
    case 'city':
      if (!v) return 'Pflichtfeld.';
      return CITY_RE.test(v) ? null : 'Nur Buchstaben, Leerzeichen und - / . ( ).';
    case 'street':
      if (!v) return 'Pflichtfeld.';
      return /\d/.test(v) ? null : 'Bitte mit Hausnummer.';
    case 'zip':
      if (!v) return 'Pflichtfeld.';
      return ZIP_RE.test(v) ? null : 'Die PLZ hat 5 Ziffern.';
    case 'vin':
      if (!v) return 'Pflichtfeld.';
      if (!VIN_ALLOWED_RE.test(v)) {
        return /[IOQ]/.test(v)
          ? 'I, O und Q kommen in der FIN nicht vor – meist ist 1 oder 0 gemeint.'
          : 'Nur Buchstaben und Ziffern.';
      }
      return v.length === 17 ? null : `Die FIN hat 17 Zeichen (jetzt ${v.length}).`;
    case 'plateDistrict':
      if (!v) return 'Pflichtfeld.';
      return PLATE_DISTRICT_RE.test(v) ? null : '1–3 Buchstaben, z. B. LÜN.';
    case 'plateLetters':
      if (!v) return 'Pflichtfeld.';
      return PLATE_LETTERS_RE.test(v) ? null : '1–2 Buchstaben ohne Umlaute.';
    case 'plateNumber': {
      if (!v) return 'Pflichtfeld.';
      if (!PLATE_NUMBER_RE.test(v)) return '1–4 Ziffern (nicht mit 0 beginnend), ggf. E oder H am Ende.';
      const total = (all.plateDistrict ?? '').length + (all.plateLetters ?? '').length + v.replace(/[EH]$/, '').length;
      return total <= 8 ? null : 'Kennzeichen zu lang – höchstens 8 Zeichen.';
    }
    case 'verbleib':
      return VERBLEIB.includes(v) ? null : 'Bitte auswählen, was mit dem Fahrzeug passiert.';
    case 'verwertungDatum': {
      if (!needsDisposal(all.verbleib)) return null;
      if (!v) return 'Pflichtfeld.';
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
      const t = m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN;
      const valid = m && new Date(t).getUTCDate() === +m[3] && +m[1] >= 2000;
      if (!valid) return 'Bitte ein gültiges Datum eingeben.';
      return t <= Date.now() ? null : 'Das Datum liegt in der Zukunft.';
    }
    case 'verwertungStaat':
      if (!needsDisposal(all.verbleib)) return null;
      if (!v) return 'Pflichtfeld.';
      return NAME_RE.test(v) ? null : 'Bitte den Staat ausschreiben, z. B. Deutschland.';
    case 'demontageNr':
      if (all.verbleib !== 'verwertet') return null;
      if (!v) return 'Pflichtfeld.';
      return /^[A-Z0-9][A-Z0-9 ./-]{2,29}$/.test(v) ? null : 'Bitte die Nummer vom Verwertungsnachweis übernehmen.';
    case 'codeZb2':
      if (!needsDisposal(all.verbleib)) return null;
      return checkCode(v, { ...CODE_RULES.codeZb2, required: true });
    case 'codeZb1':
    case 'codeFront':
    case 'codeBack':
      return checkCode(v, CODE_RULES[name]);
    case 'privacyAccepted':
      return v === true ? null : 'Bitte bestätigen Sie, dass Sie die Datenschutzhinweise gelesen haben.';
    default:
      return null;
  }
}

/** Полная проверка формы: нормализованные значения + ошибки по полям. */
export function validateApplication(raw) {
  const values = normalize(raw);
  const errors = {};
  for (const name of FIELDS) {
    const err = validateField(name, values[name], values);
    if (err) errors[name] = err;
  }
  return { values, errors };
}

export function formatPlate({ plateDistrict, plateLetters, plateNumber }) {
  return [plateDistrict, [plateLetters, plateNumber].filter(Boolean).join(' ')].filter(Boolean).join(' ');
}
