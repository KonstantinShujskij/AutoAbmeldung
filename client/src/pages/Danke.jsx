import { Brand, Footer } from '../components/Chrome.jsx';
import { Rosette } from '../components/Decor.jsx';

// Rückkehr-Seite nach dem Mollie-Checkout. Mollie leitet hierher bei JEDEM Ausgang
// (bezahlt, abgebrochen, fehlgeschlagen) — die Wahrheit kommt per Webhook. Darum neutral.

export default function Danke() {
  return (
    <div className="app app--legal">
      <header className="mbar">
        <div className="mbar__inner">
          <Brand />
          <a className="backlink" href="/">← Zum Formular</a>
        </div>
      </header>

      <main className="thanks">
        <section className="thanks__card">
          <Rosette className="thanks__rosette" />
          <p className="kicker">Zahlung</p>
          <h1 className="thanks__title">
            Vielen <em>Dank.</em>
          </h1>
          <p className="thanks__lede">
            Wir bestätigen Ihre Zahlung. Sobald sie eingegangen ist, bereiten wir die Abmeldung bei der
            Zulassungsbehörde vor und senden Ihnen den amtlichen Bescheid per E-Mail.
          </p>
          <p className="thanks__note">
            Hat die Zahlung nicht geklappt? In Ihrer Bestätigungs-E-Mail finden Sie den Zahlungslink, um es erneut
            zu versuchen.
          </p>
          <a className="btn-ghost" href="/">Zur Startseite</a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
