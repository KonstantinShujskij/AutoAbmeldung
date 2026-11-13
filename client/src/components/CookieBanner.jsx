import { useEffect, useState } from 'react';
import { PRIVACY_PATH } from '../../../shared/legal.js';
import { getConsent, saveConsent } from '../consent.js';

// Cookie-/Einwilligungs-Banner. Erscheint beim ersten Besuch und wenn die
// Einwilligungs-Version sich geändert hat. Die Statistik (Umami) ist cookielos
// und braucht keine Zustimmung – der Banner holt die Einwilligung für künftiges
// Marketing (Google Ads) und erfüllt zugleich die Hinweispflicht.

export default function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!getConsent()) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener('aa:consent-reset', reopen);
    return () => window.removeEventListener('aa:consent-reset', reopen);
  }, []);

  if (!open) return null;

  const decide = (choice) => {
    saveConsent(choice);
    setOpen(false);
  };

  return (
    <div className="cookie" role="dialog" aria-modal="false" aria-labelledby="cookie-title">
      <div className="cookie__card">
        <div className="cookie__body">
          <h2 id="cookie-title" className="cookie__title">Cookies &amp; Statistik</h2>
          <p className="cookie__text">
            Wir nutzen eine anonyme, cookielose Reichweitenmessung, um den Dienst zu
            verbessern. Für Marketing (z.&nbsp;B. Google Ads) setzen wir Cookies nur mit
            Ihrer Einwilligung. Mehr dazu in den{' '}
            <a href={PRIVACY_PATH}>Datenschutzhinweisen</a>.
          </p>
        </div>
        <div className="cookie__actions">
          <button
            type="button"
            className="cookie__btn cookie__btn--ghost"
            onClick={() => decide({ analytics: true, ads: false })}
          >
            Nur notwendige
          </button>
          <button
            type="button"
            className="cookie__btn cookie__btn--primary"
            onClick={() => decide({ analytics: true, ads: true })}
          >
            Alle akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
