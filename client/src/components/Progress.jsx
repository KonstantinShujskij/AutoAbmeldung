import { Check } from './Decor.jsx';

export function Progress({ items, onJump }) {
  return (
    <ol className="progress">
      {items.map((it) => (
        <li key={it.id} className={it.done ? 'is-done' : ''}>
          <button type="button" onClick={() => onJump(it.id)}>
            <span className="progress__num">{it.done ? <Check className="progress__check" /> : it.num}</span>
            <span className="progress__text">
              <strong>{it.title}</strong>
              <small>{it.short}</small>
            </span>
            <span className="progress__state">{it.done ? 'erledigt' : 'offen'}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}

export function MiniBar({ items }) {
  const done = items.filter((i) => i.done).length;
  return (
    <div className="minibar" role="status" aria-label={`${done} von ${items.length} Abschnitten erledigt`}>
      {items.map((it) => (
        <span key={it.id} className={`minibar__seg ${it.done ? 'is-done' : ''}`} />
      ))}
      <span className="minibar__label">
        {done}/{items.length}
      </span>
    </div>
  );
}
