// Жизненный цикл заявки и кнопки оператора в Telegram.
// Статус хранится в БД; кнопки показывают доступные переходы из текущего статуса.

export const STATUS_LABEL = {
  eingegangen: '🆕 Новая',
  zahlung_angefordert: '💶 Счёт отправлен',
  bezahlt: '✅ Оплачено',
  in_bearbeitung: '🔧 В работе',
  abgeschlossen: '📨 Выполнено',
  storniert: '✖️ Отменена',
};

// Из какого статуса в какой можно перейти и как подписать кнопку.
export const TRANSITIONS = {
  eingegangen: [['zahlung_angefordert', '💶 Отправить счёт']],
  zahlung_angefordert: [['bezahlt', '✅ Оплачено'], ['storniert', '✖️ Отмена']],
  bezahlt: [['in_bearbeitung', '🔧 Взять в работу'], ['storniert', '✖️ Отмена']],
  in_bearbeitung: [['abgeschlossen', '📨 Готово'], ['storniert', '✖️ Отмена']],
  abgeschlossen: [],
  storniert: [],
};

export const canTransition = (from, to) => (TRANSITIONS[from] ?? []).some(([t]) => t === to);

/** Inline-клавиатура: индикатор статуса + кнопки доступных переходов. */
export function statusKeyboard(id, status) {
  const rows = [[{ text: `Статус: ${STATUS_LABEL[status] ?? status}`, callback_data: 'noop' }]];
  const actions = (TRANSITIONS[status] ?? []).map(([to, label]) => ({ text: label, callback_data: `st:${id}:${to}` }));
  if (actions.length) rows.push(actions);
  return { inline_keyboard: rows };
}
