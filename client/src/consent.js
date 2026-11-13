// Einwilligungs-Status (Cookie-Banner).
//
// Umami läuft cookielos und ohne Personenprofil – dafür ist nach § 25 TDDDG
// keine Einwilligung nötig, es lädt also immer. Der Banner verwaltet die
// Einwilligung für Marketing (künftig Google Ads): die wird hier gespeichert
// und von einem späteren Ads-Tag vor dem Laden geprüft.

const KEY = 'aa_consent';
// Version hochzählen, wenn sich die Kategorien/der Text ändern → Banner erscheint erneut.
export const CONSENT_VERSION = 1;

/** @returns {{necessary:true, analytics:boolean, ads:boolean, at:string, v:number}|null} */
export function getConsent() {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!c || c.v !== CONSENT_VERSION) return null; // nie gefragt oder veraltet
    return c;
  } catch {
    return null;
  }
}

/** Entscheidung speichern. `analytics`/`ads` sind Booleans. */
export function saveConsent({ analytics = false, ads = false }) {
  const c = { necessary: true, analytics, ads, at: new Date().toISOString(), v: CONSENT_VERSION };
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* privater Modus o. Ä. – dann gilt die Wahl nur für diesen Besuch */
  }
  window.dispatchEvent(new CustomEvent('aa:consent', { detail: c }));
  applyConsent(c);
  return c;
}

/** Banner erneut zeigen (Link „Cookie-Einstellungen“ im Footer). */
export function resetConsent() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('aa:consent-reset'));
}

// ─── Tags laden ──────────────────────────────────────────────────────────────
// Erst gesetzt, wenn die Statistik-Instanz (Umami) steht: dann hier eintragen
// und neu deployen. Leer = es wird nichts geladen (kein toter Request).
const UMAMI_SRC = ''; // z. B. 'https://stats.autofahrerswelt.de/script.js'
const UMAMI_WEBSITE_ID = ''; // UUID aus dem Umami-Dashboard

let umamiLoaded = false;
function loadUmami() {
  if (umamiLoaded || !UMAMI_SRC || !UMAMI_WEBSITE_ID) return;
  umamiLoaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = UMAMI_SRC;
  s.setAttribute('data-website-id', UMAMI_WEBSITE_ID);
  // Keine automatische Verfolgung über Unterseiten hinweg ohne Bedarf: Standard reicht.
  document.head.appendChild(s);
}

/** Wendet eine Einwilligung an: Umami immer (cookielos), Ads nur bei Zustimmung. */
export function applyConsent(c) {
  // Umami ist cookielos → ohne Einwilligung erlaubt. Lädt bei jedem Seitenaufruf.
  loadUmami();
  // Google Ads / Remarketing kommt später und nur mit c.ads === true.
}

// Beim Laden anwenden, was schon entschieden wurde (Umami startet so sofort).
if (typeof window !== 'undefined') {
  applyConsent(getConsent() ?? { analytics: false, ads: false });
}
