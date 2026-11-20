import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { loadPlzDirectory } from '../plzDirectory.js';

// Выпадающий список подсказок. Через портал в <body>, position:fixed —
// иначе его обрезал бы overflow:hidden у .zgrid.
function SuggestList({ anchorRef, id, items, active, onPick, onHover }) {
  const [rect, setRect] = useState(null);
  useLayoutEffect(() => {
    const el = anchorRef.current;
    if (!el) return undefined;
    const update = () => setRect(el.getBoundingClientRect());
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [anchorRef, items]);
  if (!rect) return null;
  const style = {
    position: 'fixed',
    top: Math.round(rect.bottom + 4),
    left: Math.round(rect.left),
    width: Math.round(Math.max(rect.width, 240)),
  };
  return createPortal(
    <ul className="combo__list" id={id} role="listbox" style={style}>
      {items.map((it, i) => (
        <li
          key={(it.zip ?? '') + '|' + it.city}
          role="option"
          aria-selected={i === active}
          className={`combo__item ${i === active ? 'is-active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault(); // не терять фокус раньше, чем отработает выбор
            onPick(it);
          }}
          onMouseEnter={() => onHover(i)}
        >
          <span className="combo__main">{it.label}</span>
          <span className="combo__sub">{it.sub}</span>
        </li>
      ))}
    </ul>,
    document.body,
  );
}

/**
 * Поле ввода с подсказками из справочника городов.
 *  kind      — 'plz' | 'ort'
 *  a         — проброс id/aria из FieldCell
 *  field     — имя поля (для data-field и фокуса по ошибке)
 *  value     — текущее значение
 *  sanitize  — очистка ввода (для PLZ — только цифры, максимум 5)
 *  onInput   — (строка) => void, записать очищенное значение
 *  onPick    — ({zip, city}) => void, применить выбранную пару
 *  onBlur    — отметить поле «тронутым»
 */
export function AddrCombo({ kind, a, field, value, sanitize, onInput, onPick, onBlur, ...inputProps }) {
  const [dir, setDir] = useState(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);
  const blurTimer = useRef(null);

  const ensure = () => {
    if (!dir) loadPlzDirectory().then(setDir).catch(() => {});
  };

  useEffect(() => () => clearTimeout(blurTimer.current), []);

  // Пересчёт подсказок при изменении значения или загрузке справочника.
  useEffect(() => {
    if (!dir) {
      setItems([]);
      return;
    }
    setItems(kind === 'plz' ? dir.searchPlz(value) : dir.searchOrt(value));
    setActive(-1);
  }, [value, dir, kind]);

  const listId = `combo-${field}`;
  const show = open && items.length > 0;

  const choose = (it) => {
    onPick(it);
    setOpen(false);
    setItems([]);
    setActive(-1);
  };

  const onKeyDown = (e) => {
    if (!show) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      if (active >= 0) {
        e.preventDefault();
        choose(items[active]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <span className="combo" ref={wrapRef}>
      <input
        {...a}
        {...inputProps}
        data-field={field}
        name={field}
        value={value}
        autoComplete="off"
        role="combobox"
        aria-expanded={show}
        aria-controls={show ? listId : undefined}
        aria-autocomplete="list"
        onChange={(e) => {
          onInput(sanitize ? sanitize(e.target.value) : e.target.value);
          setOpen(true);
          ensure();
        }}
        onFocus={() => {
          ensure();
          setOpen(true);
        }}
        onBlur={(e) => {
          blurTimer.current = setTimeout(() => setOpen(false), 120);
          onBlur?.(e);
        }}
        onKeyDown={onKeyDown}
      />
      {show && (
        <SuggestList
          anchorRef={wrapRef}
          id={listId}
          items={items}
          active={active}
          onPick={choose}
          onHover={setActive}
        />
      )}
    </span>
  );
}
