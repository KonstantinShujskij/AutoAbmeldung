// FIN (VIN) und die Prüfziffer aus Feld (3) der deutschen Zulassungsbescheinigung.
//
// Die Prüfziffer steht in ZB I und ZB II direkt neben der FIN. Berechnung:
// Zeichen → Zahl (Ziffern bleiben, Buchstaben nach ISO 3779: A=1 … H=8, J=1 … R=9, S=2 … Z=9),
// gewichtet mit 9 8 7 6 5 4 3 2 10 9 8 7 6 5 4 3 2, Summe mod 11, Rest 10 → «X».
// Damit fällt fast jeder Lesefehler in der FIN auf, ohne den Kunden zu fragen.
// Quelle: KBA-Leitfaden, Anlage 2 (Beispiel A1BS31Z0430336179 → 4).
//
// Seit Juli 2026 bleibt Feld (3) leer, wenn Stelle 9 der FIN schon eine gültige
// EU-Prüfziffer ist (VO (EU) 2021/535) — dann prüfen wir diese (vinHasEuCheckDigit).

const LETTER_VALUE = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};
const WEIGHTS = [9, 8, 7, 6, 5, 4, 3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2];

export const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;

/** Prüfziffer ('0'–'9' oder 'X') für eine 17-stellige FIN, sonst null. */
export function vinCheckDigit(vin) {
  if (!VIN_RE.test(vin)) return null;
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const c = vin[i];
    sum += (c >= '0' && c <= '9' ? Number(c) : LETTER_VALUE[c]) * WEIGHTS[i];
  }
  const rest = sum % 11;
  return rest === 10 ? 'X' : String(rest);
}

const EU_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

/** Stelle 9 ist eine gültige Prüfziffer nach EU/ISO 3779 (nicht jede FIN hat eine). */
export function vinHasEuCheckDigit(vin) {
  if (!VIN_RE.test(vin)) return false;
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const c = vin[i];
    sum += (c >= '0' && c <= '9' ? Number(c) : LETTER_VALUE[c]) * EU_WEIGHTS[i];
  }
  const rest = sum % 11;
  return vin[8] === (rest === 10 ? 'X' : String(rest));
}

/**
 * OCR-Text → FIN-Zeichen: Großbuchstaben, ohne Trenner.
 * I, O und Q gibt es in der FIN nicht — gemeint sind 1 und 0.
 */
export function normalizeVinText(text) {
  return String(text ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/[OQ]/g, '0')
    .replace(/I/g, '1');
}
