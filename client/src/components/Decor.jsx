import { useMemo } from 'react';

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

/** Гильош-розетка, как на защищённых бланках. Чистая математика (гипотрохоиды). */
export function Rosette({ className }) {
  const paths = useMemo(() => {
    const layers = [
      { R: 120, r: 42, d: 74 },
      { R: 120, r: 42, d: 62 },
      { R: 120, r: 42, d: 50 },
      { R: 120, r: 45, d: 84 },
      { R: 120, r: 45, d: 30 },
    ];
    return layers.map(({ R, r, d }) => {
      const turns = r / gcd(R, r);
      const steps = 420 * turns;
      const k = (R - r) / r;
      let p = '';
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2 * turns;
        const x = (R - r) * Math.cos(t) + d * Math.cos(k * t);
        const y = (R - r) * Math.sin(t) - d * Math.sin(k * t);
        p += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      return p;
    });
  }, []);

  return (
    <svg className={className} viewBox="-200 -200 400 400" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="0.55">
        {paths.map((d, i) => (
          <path key={i} d={d} opacity={1 - i * 0.12} />
        ))}
        <circle r="176" strokeDasharray="1 3" />
        <circle r="186" />
        <circle r="190" strokeWidth="0.3" />
      </g>
    </svg>
  );
}

/** Знак бренда: печать. */
export function BrandMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="var(--green)" />
      <circle cx="20" cy="20" r="15" fill="none" stroke="var(--paper)" strokeWidth="1" strokeDasharray="1.6 1.6" />
      <path d="M12.5 25.5 L20 11 L27.5 25.5 M15.6 20.5 H24.4" fill="none" stroke="var(--paper)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Check({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.5 8.5 L6.6 11.4 L12.5 4.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Arrow({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10 H15 M10.5 5.5 L15 10 L10.5 14.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Псевдо-DataMatrix: декоративный, детерминированный по seed. */
export function DataMatrix({ seed = 1, size = 10, className }) {
  const cells = useMemo(() => {
    let s = seed * 7919 + 17;
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const out = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let on;
        if (x === 0 || y === size - 1) on = true; // сплошная «L»-рамка
        else if (y === 0) on = x % 2 === 0; // пунктир сверху
        else if (x === size - 1) on = y % 2 === 1; // пунктир справа
        else on = rnd() > 0.52;
        if (on) out.push(`M${x} ${y}h1v1h-1z`);
      }
    }
    return out.join('');
  }, [seed, size]);

  return (
    <svg className={className} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges" aria-hidden="true">
      <path d={cells} fill="currentColor" />
    </svg>
  );
}

/** Печать «Eingang» для подтверждения. */
export function Stamp({ date, className }) {
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <path id="stamp-ring" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
      </defs>
      <g fill="none" stroke="currentColor">
        <circle cx="100" cy="100" r="93" strokeWidth="4" />
        <circle cx="100" cy="100" r="86" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="55" strokeWidth="1.2" />
      </g>
      <text fill="currentColor" fontFamily="var(--f-mono)" fontSize="12.5" fontWeight="600" letterSpacing="2">
        <textPath href="#stamp-ring" textLength="448" lengthAdjust="spacing">
          AUTOFAREN · ANTRAG EINGEGANGEN · ONLINE ·
        </textPath>
      </text>
      <text x="100" y="99" textAnchor="middle" fill="currentColor" fontFamily="var(--f-display)" fontStyle="italic" fontSize="26">
        Eingang
      </text>
      <text x="100" y="121" textAnchor="middle" fill="currentColor" fontFamily="var(--f-mono)" fontSize="12" fontWeight="600" letterSpacing="1">
        {date}
      </text>
    </svg>
  );
}
