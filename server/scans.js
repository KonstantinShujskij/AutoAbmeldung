// Фото ZB II между «распознать» и «отправить заявку».
// Держим только в памяти, не дольше TTL, и удаляем сразу после отправки заявки.
// На диск фото не попадает; после перезапуска сервера оно просто теряется.

import { randomBytes } from 'node:crypto';

const TTL_MS = 2 * 60 * 60_000;
const MAX_ITEMS = 200;
const store = new Map(); // id → { jpeg, meta, expires }

function sweep() {
  const now = Date.now();
  for (const [id, item] of store) if (item.expires < now) store.delete(id);
  while (store.size > MAX_ITEMS) store.delete(store.keys().next().value);
}

/** @returns {string} scanId — клиент вернёт его вместе с заявкой */
export function keepScan(jpeg, meta = {}) {
  sweep();
  const id = randomBytes(16).toString('base64url');
  store.set(id, { jpeg, meta, expires: Date.now() + TTL_MS });
  return id;
}

/** Забрать фото (один раз): после этого оно из памяти удалено. */
export function takeScan(id) {
  if (typeof id !== 'string' || !store.has(id)) return null;
  const item = store.get(id);
  store.delete(id);
  return item.expires >= Date.now() ? item : null;
}
