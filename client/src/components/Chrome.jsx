import { IMPRESSUM_PATH, PRIVACY_PATH } from '../../../shared/legal.js';
import { BrandMark } from './Decor.jsx';

export function Brand({ className = '' }) {
  return (
    <a className={`brand ${className}`} href="/" aria-label="AutoFaren – Startseite">
      <BrandMark className="brand__mark" />
      <span className="brand__name">
        Auto<em>Faren</em>
      </span>
    </a>
  );
}

/** newTab — со страницы формы ссылки открываем в новой вкладке, чтобы не потерять ввод. */
export function Footer({ newTab = false }) {
  const linkProps = newTab ? { target: '_blank', rel: 'noopener' } : {};
  return (
    <footer className="footer">
      <span>AutoFaren ist ein privater Dienst und keine Behörde.</span>
      <nav className="footer__nav" aria-label="Rechtliches">
        <a href={IMPRESSUM_PATH} {...linkProps}>
          Impressum
        </a>
        <a href={PRIVACY_PATH} {...linkProps}>
          Datenschutz
        </a>
        <span className="mono">v0.1</span>
      </nav>
    </footer>
  );
}
