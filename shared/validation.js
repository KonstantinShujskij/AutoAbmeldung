// Общие правила валидации — используются и во фронтенде, и на сервере.
// Сообщения на немецком: их видит клиент.

/**
 * Защитные коды: длина и обязательность.
 * Код ZB II для Außerbetriebsetzung не нужен (проверено на портале i-Kfz Kreis Unna),
 * поэтому его не собираем — открытая наклейка делает ZB II недействительным.
 */
export const CODE_RULES = {
  codeZb1: { length: 7, required: true }, // Zulassungsbescheinigung Teil I, Rückseite
  codeFront: { length: 3, required: true }, // Stempelplakette vorne
  codeBack: { length: 3, required: true }, // Stempelplakette hinten
};

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
  'codeZb1',
  'codeFront',
  'codeBack',
  'privacyAccepted', // галочка «Datenschutzhinweise zur Kenntnis genommen» (boolean)
];

export const SECTIONS = [
  { id: 'kontakt', fields: ['email'] },
  { id: 'halter', fields: ['lastName', 'firstName', 'street', 'zip', 'city'] },
  { id: 'fahrzeug', fields: ['vin', 'plateDistrict', 'plateLetters', 'plateNumber'] },
  { id: 'codes', fields: ['codeZb1', 'codeFront', 'codeBack'] },
];

// Галочка по умолчанию НЕ отмечена (EuGH «Planet49»: заранее поставленные галочки недопустимы).
export const EMPTY_FORM = { ...Object.fromEntries(FIELDS.map((f) => [f, ''])), privacyAccepted: false };

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
