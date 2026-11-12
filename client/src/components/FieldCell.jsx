/**
 * Ячейка в стиле Zulassungsbescheinigung: слева код поля (как «C.3.1» на документе),
 * справа подпись и сам ввод. Ввод передаётся render-prop'ом, чтобы получить id/aria.
 */
export function FieldCell({ id, code, label, hint, hintTone, error, optional, className = '', children }) {
  const msgId = `${id}-msg`;
  const message = error || hint;
  return (
    <div className={`zcell ${error ? 'has-error' : ''} ${className}`}>
      <span className="zcell__code" aria-hidden="true">
        {code}
      </span>
      <div className="zcell__main">
        <label className="zcell__label" htmlFor={id}>
          {label}
          {optional && <span className="zcell__optional">optional</span>}
        </label>
        {children({
          id,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': message ? msgId : undefined,
        })}
        {message && (
          <p id={msgId} className={error ? 'zcell__error' : `zcell__hint${hintTone ? ` zcell__hint--${hintTone}` : ''}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

/** Линейка из 17 делений под FIN: WMI (3) · VDS (6) · VIS (8). */
export function VinRuler({ length }) {
  const groups = [
    { name: 'Hersteller', from: 0, to: 3 },
    { name: 'Fahrzeugtyp', from: 3, to: 9 },
    { name: 'Seriennummer', from: 9, to: 17 },
  ];
  return (
    <div className="vinruler" aria-hidden="true">
      {groups.map((g) => (
        <div key={g.name} className="vinruler__group" style={{ flexGrow: g.to - g.from }}>
          <div className="vinruler__ticks">
            {Array.from({ length: g.to - g.from }, (_, i) => (
              <span key={i} className={g.from + i < length ? 'is-on' : ''} />
            ))}
          </div>
          <span className="vinruler__name">{g.name}</span>
        </div>
      ))}
      <span className={`vinruler__count ${length === 17 ? 'is-full' : ''}`}>{length}/17</span>
    </div>
  );
}
