import { useRef } from 'react';

function starPath(cx, cy, r) {
  let d = '';
  for (let k = 0; k < 10; k++) {
    const rad = k % 2 === 0 ? r : r * 0.42;
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    d += `${k ? 'L' : 'M'}${(cx + Math.cos(a) * rad).toFixed(2)} ${(cy + Math.sin(a) * rad).toFixed(2)}`;
  }
  return `${d}Z`;
}

const STARS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return starPath(Math.cos(a) * 6.6, Math.sin(a) * 6.6, 1.45);
}).join('');

function EuBand() {
  return (
    <span className="plate__band" aria-hidden="true">
      <svg viewBox="-10 -10 20 20" className="plate__stars">
        <path d={STARS} />
      </svg>
      <span className="plate__country">D</span>
    </span>
  );
}

function Seals({ rear }) {
  return (
    <span className="plate__seals" aria-hidden="true">
      {rear && <i className="plate__seal plate__seal--hu" />}
      <i className="plate__seal plate__seal--district" />
    </span>
  );
}

/** Номерной знак только для показа. */
export function PlateView({ district, letters, number, size = 'md', rear = false, className = '' }) {
  return (
    <span className={`plate plate--${size} ${className}`}>
      <EuBand />
      <span className="plate__body">
        <span className={`plate__text ${district ? '' : 'is-ghost'}`}>{district || 'XXX'}</span>
        <Seals rear={rear} />
        <span className={`plate__text ${letters ? '' : 'is-ghost'}`}>{letters || 'AB'}</span>
        <span className={`plate__text ${number ? '' : 'is-ghost'}`}>{number || '123'}</span>
      </span>
    </span>
  );
}

const SEGMENTS = [
  { name: 'plateDistrict', max: 3, filter: /[^A-ZÄÖÜ]/g, placeholder: 'LÜN', label: 'Unterscheidungszeichen (Ort), z. B. LÜN' },
  { name: 'plateLetters', max: 2, filter: /[^A-Z]/g, placeholder: 'AB', label: 'Buchstaben der Erkennungsnummer' },
  { name: 'plateNumber', max: 5, filter: /[^0-9EH]/g, placeholder: '123', label: 'Ziffern der Erkennungsnummer, ggf. mit E oder H' },
];

const FULL_PLATE_RE = /^\s*([A-ZÄÖÜ]{1,3})[\s:·-]+([A-Z]{1,2})[\s-]*(\d{1,4}[EH]?)\s*$/;

/**
 * Ввод номера прямо «на табличке»: три сегмента.
 * Пробел/дефис или заполненный сегмент переводят фокус дальше,
 * вставка целого номера («LÜN-AB 123») раскладывается по сегментам.
 */
export function PlateInput({ id, values, onChange, onBlur, invalid, describedBy }) {
  const refs = [useRef(null), useRef(null), useRef(null)];

  const focus = (i) => {
    const el = refs[i]?.current;
    if (!el) return;
    el.focus();
    requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length));
  };

  const handleChange = (i) => (e) => {
    const raw = e.target.value.toUpperCase();

    const full = raw.match(FULL_PLATE_RE);
    if (full) {
      onChange('plateDistrict', full[1]);
      onChange('plateLetters', full[2]);
      onChange('plateNumber', full[3]);
      focus(2);
      return;
    }

    // В поле букв набрали цифру — переносим её в поле цифр.
    if (i === 1 && /\d/.test(raw)) {
      const letters = raw.replace(/[^A-Z]/g, '').slice(0, 2);
      const digits = raw.replace(/[^0-9]/g, '');
      onChange('plateLetters', letters);
      onChange('plateNumber', (values.plateNumber + digits).slice(0, 5));
      focus(2);
      return;
    }

    const seg = SEGMENTS[i];
    const clean = raw.replace(seg.filter, '').slice(0, seg.max);
    onChange(seg.name, clean);

    const wantsNext = /[\s\-·]$/.test(raw) || (clean.length === seg.max && i < 2);
    if (wantsNext && clean.length > 0 && i < 2) focus(i + 1);
  };

  const handleKeyDown = (i) => (e) => {
    const el = e.currentTarget;
    if (e.key === 'Backspace' && el.selectionStart === 0 && el.selectionEnd === 0 && i > 0) {
      e.preventDefault();
      focus(i - 1);
    }
    if (e.key === 'ArrowRight' && el.selectionStart === el.value.length && i < 2) {
      e.preventDefault();
      focus(i + 1);
    }
    if (e.key === 'ArrowLeft' && el.selectionStart === 0 && i > 0) {
      e.preventDefault();
      focus(i - 1);
    }
  };

  const input = (i) => {
    const seg = SEGMENTS[i];
    return (
      <input
        ref={refs[i]}
        id={i === 0 ? id : undefined}
        data-field={seg.name}
        className={`plate__seg plate__seg--${i}`}
        value={values[seg.name]}
        placeholder={seg.placeholder}
        aria-label={seg.label}
        aria-invalid={invalid?.[seg.name] ? true : undefined}
        aria-describedby={describedBy}
        onChange={handleChange(i)}
        onKeyDown={handleKeyDown(i)}
        onBlur={() => onBlur(seg.name)}
        autoComplete="off"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="next"
      />
    );
  };

  return (
    <span className="plate plate--lg plate--input">
      <EuBand />
      <span className="plate__body">
        {input(0)}
        <Seals />
        {input(1)}
        {input(2)}
      </span>
    </span>
  );
}
