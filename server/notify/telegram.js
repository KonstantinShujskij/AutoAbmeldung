// Новая заявка → сообщение в рабочую группу Telegram (бот + группа из .env).
// Текст по-русски для команды, значения — как в документах. Коды в <code>, чтобы
// копировались одним нажатием. Фото ZB II — следующим сообщением, ответом на заявку.

import { createHash } from 'node:crypto';
import { VERBLEIB_RU, dateDe, dateTimeDe, plateOf } from './format.js';

const API = 'https://api.telegram.org';

export const telegramEnabled = () => Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const CAPTION_LIMIT = 1024;
// Длина текста так, как её считает Telegram: без HTML-тегов, сущности — по одному символу.
const visibleLength = (html) => [...html.replace(/<[^>]+>/g, '').replace(/&(amp|lt|gt|quot);/g, '_')].length;
const code = (s) => `<code>${esc(s)}</code>`;

const VIN_SOURCE = {
  verified: 'с фото, подтверждён Prüfziffer ✅',
  check: 'с фото, НЕ подтверждён — сверить ⚠️',
};

export function formatApplication(record, { vinFromScan } = {}) {
  const d = record.data;
  const lines = [
    `🚗 <b>Новая заявка на снятие с учёта</b>`,
    `${code(record.id)} · ${esc(dateTimeDe(record.createdAt))}`,
    '',
    `<b>Клиент</b>`,
    `✉️ ${esc(d.email)}`,
    '',
    `<b>Владелец</b>`,
    `${esc(d.lastName)}, ${esc(d.firstName)}`,
    `${esc(d.street)}, ${esc(d.zip)} ${esc(d.city)}`,
    '',
    `<b>Машина</b>`,
    `Номер: <b>${esc(plateOf(d))}</b>`,
    `FIN: ${code(d.vin)}${vinFromScan && VIN_SOURCE[vinFromScan] ? `\n<i>${VIN_SOURCE[vinFromScan]}</i>` : ''}`,
    `Что с машиной: ${esc(VERBLEIB_RU[d.verbleib] ?? d.verbleib)}`,
  ];
  if (d.verbleib === 'verwertet' || d.verbleib === 'ausland') {
    lines.push(`Утилизация: ${esc(dateDe(d.verwertungDatum))}, ${esc(d.verwertungStaat)}`);
    if (d.demontageNr) lines.push(`Demontagebetrieb №: ${code(d.demontageNr)}`);
  }
  lines.push('', `<b>Коды безопасности</b>`, `ZB I: ${code(d.codeZb1)}`);
  if (d.codeZb2) lines.push(`ZB II: ${code(d.codeZb2)}`);
  lines.push(`Номер спереди: ${code(d.codeFront)} · сзади: ${code(d.codeBack)}`);
  return lines.join('\n');
}

async function call(method, body) {
  const res = await fetch(`${API}/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(30_000),
    ...(body instanceof FormData ? {} : { headers: { 'content-type': 'application/json' } }),
  });
  const json = await res.json().catch(() => ({}));
  if (!json.ok) throw new Error(`Telegram ${method}: ${json.description ?? res.status}`);
  return json.result;
}

/**
 * @param {object} record — сохранённая заявка
 * @param {{ jpeg?: Buffer, vinFromScan?: string }} [extra]
 */
export async function sendToTelegram(record, { jpeg, vinFromScan } = {}) {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const text = formatApplication(record, { vinFromScan });

  // Есть фото и текст влезает в подпись (лимит Telegram — 1024 видимых символа):
  // одно сообщение — фото, под ним заявка и кнопка.
  if (jpeg && visibleLength(text) <= CAPTION_LIMIT) {
    const form = new FormData();
    form.set('chat_id', chatId);
    form.set('caption', text);
    form.set('parse_mode', 'HTML');
    form.set('reply_markup', JSON.stringify(invoiceKeyboard(record.id)));
    form.set('photo', new Blob([jpeg], { type: 'image/jpeg' }), `${record.id}.jpg`);
    await call('sendPhoto', form);
    return;
  }

  const message = await call('sendMessage', JSON.stringify({
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    reply_markup: invoiceKeyboard(record.id),
  }));
  // Текст слишком длинный для подписи — фото отдельным ответом на заявку.
  if (jpeg) {
    const form = new FormData();
    form.set('chat_id', chatId);
    form.set('caption', `📄 Фото ZB II · ${record.id}`);
    form.set('reply_parameters', JSON.stringify({ message_id: message.message_id }));
    form.set('photo', new Blob([jpeg], { type: 'image/jpeg' }), `${record.id}.jpg`);
    await call('sendPhoto', form);
  }
}

// ─── Кнопка «отправить счёт» ────────────────────────────────────────────────
// Оператор внёс данные на портал → жмёт кнопку → клиенту уходит письмо с оплатой,
// а кнопка превращается в отметку «✅ счёт отправлен», чтобы не нажать дважды.

const INVOICE_RE = /^inv:(AF-\d{4}-[A-Z0-9]{6})$/;

function invoiceKeyboard(id) {
  return { inline_keyboard: [[{ text: '💶 Данные внесены — отправить счёт клиенту', callback_data: `inv:${id}` }]] };
}

function doneKeyboard(text) {
  return { inline_keyboard: [[{ text, callback_data: 'noop' }]] };
}

/** Секрет для заголовка X-Telegram-Bot-Api-Secret-Token — производный от токена бота. */
export function webhookSecret() {
  return createHash('sha256').update(`webhook:${process.env.TELEGRAM_BOT_TOKEN}`).digest('hex').slice(0, 48);
}

/** Регистрирует webhook: Telegram будет присылать нажатия кнопок на наш сервер. */
export async function setupWebhook(publicUrl) {
  await call('setWebhook', JSON.stringify({
    url: `${publicUrl.replace(/\/+$/, '')}/api/telegram/webhook`,
    secret_token: webhookSecret(),
    allowed_updates: ['callback_query'],
  }));
}

/**
 * Обработка входящего update. onInvoice(id, operatorName) должна вернуть
 * { status: 'sent' | 'already' | 'error', message?: string, at?: string, by?: string }.
 */
export async function handleUpdate(update, { onInvoice }) {
  const q = update?.callback_query;
  if (!q) return;
  const answer = (text, alert = false) =>
    call('answerCallbackQuery', JSON.stringify({ callback_query_id: q.id, text, show_alert: alert })).catch(() => {});

  // Только из нашей рабочей группы.
  if (String(q.message?.chat?.id) !== String(process.env.TELEGRAM_CHAT_ID)) return answer('Нет доступа.');
  if (q.data === 'noop') return answer('Уже сделано.');
  const m = INVOICE_RE.exec(q.data ?? '');
  if (!m) return answer('Неизвестная кнопка.');

  const operator = [q.from?.first_name, q.from?.last_name].filter(Boolean).join(' ') || q.from?.username || 'оператор';
  const result = await onInvoice(m[1], operator).catch((err) => ({ status: 'error', message: err.message }));

  if (result.status === 'error') return answer(`⚠️ Письмо не отправлено: ${result.message}`, true);
  const when = new Date(result.at).toLocaleString('ru-RU', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  await call('editMessageReplyMarkup', JSON.stringify({
    chat_id: q.message.chat.id,
    message_id: q.message.message_id,
    reply_markup: doneKeyboard(`✅ Счёт отправлен · ${when} · ${result.by}`),
  })).catch(() => {});
  return answer(result.status === 'already' ? 'Счёт уже был отправлен раньше.' : '✅ Письмо с оплатой отправлено клиенту.');
}
