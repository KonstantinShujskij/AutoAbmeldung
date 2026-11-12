import { IMPRESSUM_PATH, PRIVACY_PATH, RATGEBER_PATH, KOSTEN_PATH, FAQ_PATH } from '../../../shared/legal.js';
import { BrandMark } from './Decor.jsx';

export function Brand({ className = '' }) {
  return (
    <a className={`brand ${className}`} href="/" aria-label="AutoAbmeldung – Startseite">
      <BrandMark className="brand__mark" />
      <span className="brand__name">
        Auto<em>Abmeldung</em>
      </span>
    </a>
  );
}

/** newTab — со страницы формы ссылки открываем в новой вкладке, чтобы не потерять ввод. */
export function Footer({ newTab = false }) {
  const linkProps = newTab ? { target: '_blank', rel: 'noopener' } : {};
  return (
    <footer className="footer">
      <span>AutoAbmeldung ist ein privater Dienst und keine Behörde.</span>
      <nav className="footer__nav" aria-label="Seiten">
        <a href={RATGEBER_PATH} {...linkProps}>Ratgeber</a>
        <a href={KOSTEN_PATH} {...linkProps}>Kosten</a>
        <a href={FAQ_PATH} {...linkProps}>FAQ</a>
        <a href={IMPRESSUM_PATH} {...linkProps}>Impressum</a>
        <a href={PRIVACY_PATH} {...linkProps}>Datenschutz</a>
        <a href="https://autofahrerswelt.de" target="_blank" rel="noopener">autofahrerswelt.de</a>
      </nav>
    </footer>
  );
}
