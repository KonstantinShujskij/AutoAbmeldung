// Чтение ZB II/ZB I через OpenAI (Responses API, structured outputs).
// Нужен для данных владельца (две колонки, умлауты — локальный OCR тут не справляется)
// и как второе, независимое прочтение FIN и Prüfziffer.
//
// Модель выбрана тестом на фото ZB II (2026-11-12): gpt-5.4-mini — FIN 10/10, номер 10/10;
// gpt-5.6-luna дешевле, но путала FIN (7/10) и умлауты в номере. Меняется через OPENAI_MODEL.

const API_URL = 'https://api.openai.com/v1/responses';
const TIMEOUT_MS = 40_000;

const INSTRUCTIONS = `You read photos of German vehicle registration documents (Zulassungsbescheinigung Teil II or Teil I).
Copy values exactly as printed, character by character. Never guess, never "correct" spelling, keep umlauts (Ä Ö Ü ß).

- documentType: "zb2" for Teil II (Fahrzeugbrief), "zb1" for Teil I (Fahrzeugschein), "other" otherwise.
- vin: field E "Fahrzeug-Identifizierungsnummer", exactly 17 characters, no spaces. The letters I, O and Q never occur in a VIN.
- vinCheckDigit: field (3) "Prüfziffer zur Fahrzeug-Identifizierungsnummer", printed right next to field E: one character 0-9 or X. Do not confuse it with the field label "(3)". Empty string if the field is empty.

holders — transcribe EVERY holder (Halter) column separately, one object per column, in order from left to right:
- Teil II: the upper part has up to two holder columns side by side. Rows of one column:
  A = plate (amtliches Kennzeichen), C.3.1/C.6.1 = lastName, C.3.2/C.6.2 = firstName (all given names exactly as printed),
  C.3.3/C.6.3 = address, I = date ("Datum") of that column.
- Teil I: one holder: A = plate, C.1.1 = lastName, C.1.2 = firstName, C.1.3 = address, I = date.
- Each value must come from its own column only. Never move a value into another column.
- date: as printed, DD.MM.YYYY. street = street name with house number, zip = 5-digit postcode, city = place name after the postcode.
- plate: like "LÜN AB 123" (district, letters, digits), without asterisks.
- Skip columns that are completely empty.

If a value is not clearly legible, return an empty string for that value instead of guessing.`;

const HOLDER_FIELDS = ['date', 'plate', 'lastName', 'firstName', 'street', 'zip', 'city'];
const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['documentType', 'vin', 'vinCheckDigit', 'holders'],
  properties: {
    documentType: { type: 'string', enum: ['zb2', 'zb1', 'other'] },
    vin: { type: 'string' },
    vinCheckDigit: { type: 'string' },
    holders: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: HOLDER_FIELDS,
        properties: Object.fromEntries(HOLDER_FIELDS.map((f) => [f, { type: 'string' }])),
      },
    },
  },
};

export const gptEnabled = () => Boolean(process.env.OPENAI_API_KEY);

/**
 * @param {Buffer} jpeg — уже уменьшенное фото (короткая сторона ~1600 px)
 * @returns {Promise<{documentType: string, vin: string, vinCheckDigit: string,
 *   holders: Array<{date: string, plate: string, lastName: string, firstName: string,
 *   street: string, zip: string, city: string}>}>}
 *   Колонку с последней датой выбирает наш код (recognize.js), а не модель: в тестах модель
 *   на повёрнутых фото выбирала старую колонку.
 */
export async function readWithGpt(jpeg) {
  const res = await fetch(API_URL, {
    method: 'POST',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
      reasoning: { effort: 'low' },
      // Не хранить ответ у OpenAI дольше, чем нужно для обработки.
      store: false,
      instructions: INSTRUCTIONS,
      input: [{
        role: 'user',
        content: [
          { type: 'input_text', text: 'Extract the data.' },
          { type: 'input_image', image_url: `data:image/jpeg;base64,${jpeg.toString('base64')}`, detail: 'high' },
        ],
      }],
      text: { format: { type: 'json_schema', name: 'zulassungsbescheinigung', schema: SCHEMA, strict: true } },
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    throw new Error(`OpenAI ${res.status}: ${body.error?.message ?? 'unknown error'}`);
  }
  const message = body.output?.find((o) => o.type === 'message');
  const text = message?.content?.find((c) => c.type === 'output_text')?.text;
  if (!text) throw new Error('OpenAI: empty response');
  return JSON.parse(text);
}
