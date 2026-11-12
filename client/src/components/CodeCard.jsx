import { useState } from 'react';
import { Check, DataMatrix } from './Decor.jsx';
import { PlateView } from './Plate.jsx';

/**
 * Ввод защитного кода «по клеткам». Настоящий <input> лежит поверх клеток
 * прозрачным слоем — вставка, Backspace и мобильные клавиатуры работают штатно.
 * Регистр НЕ меняем: коды чувствительны к регистру.
 */
function CodeInput({ id, name, length, value, onChange, onBlur, variant, error, describedBy, label }) {
  const [focused, setFocused] = useState(false);
  const chars = value.split('');
  const complete = value.length === length;

  const cells = (
    <span className="code__cells">
      {Array.from({ length }, (_, i) => (
        <span
          key={i}
          className={[
            'code__cell',
            i < chars.length ? 'is-filled' : '',
            focused && i === chars.length ? 'is-active' : '',
          ].join(' ')}
        >
          {chars[i] ?? ''}
        </span>
      ))}
    </span>
  );

  return (
    <span
      className={[
        'code',
        `code--${variant}`,
        focused ? 'is-focused' : '',
        complete ? 'is-complete' : '',
        error ? 'is-invalid' : '',
      ].join(' ')}
      style={{ '--len': length }}
    >
      {variant === 'zb' ? (
        <span className="code__panel">
          <span className="code__void">Dokument nicht mehr gültig</span>
          <span className="code__row">
            <DataMatrix className="code__dm" seed={length} size={10} />
            {cells}
          </span>
        </span>
      ) : (
        <>
          {cells}
          <DataMatrix className="code__dm" seed={length + (id.length % 5)} size={10} />
        </>
      )}
      <input
        id={id}
        data-field={name}
        className="code__input"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur();
        }}
        aria-label={label}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="next"
      />
    </span>
  );
}

export function CodeCard({
  id,
  name,
  variant,
  title,
  doc,
  where,
  length,
  optional,
  note,
  value,
  onChange,
  onBlur,
  error,
  plate,
  rear,
  wide,
}) {
  const msgId = `${id}-msg`;
  const complete = value.length === length && !error;
  return (
    <article className={`code-card ${wide ? 'code-card--wide' : ''} ${error ? 'has-error' : ''} ${complete ? 'is-complete' : ''}`}>
      <header className="code-card__top">
        <div>
          <label className="code-card__title" htmlFor={id}>
            {title}
          </label>
          <span className="code-card__doc">{doc}</span>
        </div>
        <span className={`code-card__len ${optional ? 'is-optional' : ''}`}>
          {complete ? <Check className="code-card__check" /> : null}
          {length} Zeichen{optional ? ' · optional' : ''}
        </span>
      </header>

      <p className="code-card__where">{where}</p>

      <div className={variant === 'zb' ? 'code-bed code-bed--zb' : 'code-bed code-bed--plate'}>
        {variant === 'plate' && plate && (
          <PlateView {...plate} rear={rear} size="xs" className="code-bed__plate" />
        )}
        <CodeInput
          id={id}
          name={name}
          length={length}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          variant={variant}
          error={error}
          describedBy={error || note ? msgId : undefined}
          label={`${title}: Sicherheitscode, ${length} Zeichen`}
        />
      </div>

      {(error || note) && (
        <p id={msgId} className={error ? 'code-card__error' : 'code-card__note'}>
          {error || note}
        </p>
      )}
    </article>
  );
}
