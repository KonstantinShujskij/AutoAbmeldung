// Письма клиенту (по-немецки). SMTP — из .env.
//  1) «Auftrag eingegangen» — сразу после отправки формы;
//  2) «Bitte bezahlen» — когда оператор нажал кнопку в Telegram (данные внесены на портал).
// Коды безопасности в письма НЕ кладём: почта — не место для них.

import nodemailer from 'nodemailer';
import { VERBLEIB_DE, dateTimeDe, plateOf } from './format.js';

export const mailEnabled = () => Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM);

let transport = null;
function transporter() {
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transport;
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const site = () => (process.env.PUBLIC_URL || '').replace(/\/+$/, '');

function summary(record) {
  const d = record.data;
  const r = [
    ['Vorgangsnummer', record.id],
    ['Eingegangen am', `${dateTimeDe(record.createdAt)} Uhr`],
    ['Halter', `${d.firstName} ${d.lastName}`],
    ['Anschrift', `${d.street}, ${d.zip} ${d.city}`],
    ['Kennzeichen', plateOf(d)],
    ['FIN', d.vin],
    ['Verbleib', VERBLEIB_DE[d.verbleib] ?? d.verbleib],
  ];
  if (d.verbleib === 'abmelden') r.push(['Kennzeichen reservieren', d.reservieren ? 'Ja' : 'Nein']);
  return r;
}

const MONO = new Set(['FIN', 'Vorgangsnummer']);

/** Общая вёрстка писем в стиле сайта (таблицы и inline-стили — так понимают почтовики). */
function layout({ title, intro, rows, button, notes }) {
  const s = site();
  const html = `<!doctype html><html lang="de"><body style="margin:0;padding:0;background:#f2eee3;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2eee3;padding:28px 12px;font-family:'IBM Plex Sans','Segoe UI',Arial,sans-serif;color:#142019;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fbf9f3;border:1px solid rgba(20,32,25,.12);border-radius:10px;">
<tr><td style="padding:26px 28px 6px;font-family:Georgia,serif;font-size:22px;"><span style="color:#1d6a47;">&#9679;</span> Auto<i style="color:#1d6a47;">Faren</i></td></tr>
<tr><td style="padding:14px 28px 4px;">
  <h1 style="margin:0 0 10px;font-family:Georgia,serif;font-weight:500;font-size:26px;line-height:1.2;">${esc(title)}</h1>
  <p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:#3d4b43;">${esc(intro)}</p>
</td></tr>
${button ? `<tr><td style="padding:0 28px 20px;"><a href="${esc(button.href)}" style="display:inline-block;padding:13px 24px;border-radius:999px;background:#0f2a1e;color:#fbf9f3;font-weight:600;font-size:15px;text-decoration:none;">${esc(button.label)}</a></td></tr>` : ''}
<tr><td style="padding:0 28px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px dashed rgba(20,32,25,.24);">
  ${rows.map(([k, v]) => `<tr><td style="padding:9px 12px 9px 0;border-bottom:1px dashed rgba(20,32,25,.14);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#6c786f;white-space:nowrap;vertical-align:top;">${esc(k)}</td><td style="padding:9px 0;border-bottom:1px dashed rgba(20,32,25,.14);font-size:15px;${MONO.has(k) ? "font-family:'IBM Plex Mono',Consolas,monospace;" : ''}">${esc(v)}</td></tr>`).join('\n  ')}
  </table>
</td></tr>
<tr><td style="padding:18px 28px 26px;">
  ${notes.map((n) => `<p style="margin:0 0 10px;font-size:13.5px;line-height:1.5;color:#3d4b43;">${esc(n)}</p>`).join('\n  ')}
</td></tr>
</table>
${s ? `<p style="margin:16px 0 0;font-size:12px;color:#6c786f;"><a href="${esc(s)}/impressum" style="color:#6c786f;">Impressum</a> &middot; <a href="${esc(s)}/datenschutz" style="color:#6c786f;">Datenschutz</a></p>` : ''}
</td></tr></table></body></html>`;

  const text = [
    'Guten Tag,',
    '',
    title,
    intro,
    button ? `\n${button.label}: ${button.href}` : '',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    ...notes,
    '',
    'Ihr AutoFaren-Team',
    s ? `${s} · Impressum: ${s}/impressum · Datenschutz: ${s}/datenschutz` : '',
  ].join('\n');
  return { html, text };
}

export function confirmationMail(record) {
  const { html, text } = layout({
    title: 'Ihr Auftrag ist eingegangen',
    intro:
      'Vielen Dank! Wir prüfen Ihre Angaben und bereiten die Abmeldung bei der Zulassungsbehörde vor. ' +
      'Als Nächstes erhalten Sie von uns eine E-Mail mit der Zahlungsaufforderung.',
    rows: summary(record),
    notes: [
      'Die Sicherheitscodes senden wir aus Sicherheitsgründen nicht per E-Mail mit.',
      `Stimmt etwas nicht? Antworten Sie einfach auf diese E-Mail und nennen Sie die Vorgangsnummer ${record.id}.`,
    ],
  });
  return { subject: `Ihre Abmeldung ist eingegangen – ${record.id}`, html, text };
}

/**
 * Письмо с просьбой оплатить. Сумма и ссылка — из .env (PRICE_TEXT, PAYMENT_URL с {id});
 * пока оплата не подключена, ссылки нет — письмо просит дождаться ссылки/ответить.
 */
export function paymentMail(record) {
  const price = process.env.PRICE_TEXT;
  const url = process.env.PAYMENT_URL ? process.env.PAYMENT_URL.replaceAll('{id}', encodeURIComponent(record.id)) : null;
  const rows = [...(price ? [['Betrag', price]] : []), ...summary(record)];
  const { html, text } = layout({
    title: 'Bitte bezahlen Sie Ihre Abmeldung',
    intro:
      'Wir haben Ihren Antrag bei der Zulassungsbehörde vorbereitet. Sobald die Zahlung eingegangen ist, ' +
      'schließen wir die Abmeldung ab und senden Ihnen den amtlichen Bescheid als PDF.',
    rows,
    button: url ? { label: 'Jetzt bezahlen', href: url } : null,
    notes: [
      ...(url ? [] : ['Den Link zur Zahlung senden wir Ihnen in Kürze.']),
      `Bei Fragen antworten Sie einfach auf diese E-Mail und nennen Sie die Vorgangsnummer ${record.id}.`,
    ],
  });
  return { subject: `Zahlung für Ihre Abmeldung – ${record.id}`, html, text };
}

async function send(record, { subject, html, text }) {
  await transporter().sendMail({
    from: process.env.MAIL_FROM,
    to: record.data.email,
    replyTo: process.env.MAIL_REPLY_TO || undefined,
    subject,
    text,
    html,
  });
}

export const sendConfirmation = (record) => send(record, confirmationMail(record));
export const sendPaymentRequest = (record) => send(record, paymentMail(record));
