import { CODE_RULES } from '../../../shared/validation.js';
import { Stamp } from './Decor.jsx';
import { PlateView } from './Plate.jsx';

const dateFmt = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function Confirmation({ result, onReset }) {
  const v = result.values;
  const codesTotal = Object.keys(CODE_RULES).length;
  const codesGiven = Object.keys(CODE_RULES).filter((k) => v[k]).length;

  return (
    <section className="receipt" aria-labelledby="receipt-title">
      <Stamp className="receipt__stamp" date={dateFmt.format(new Date(result.createdAt))} />

      <p className="kicker">Eingangsbestätigung</p>
      <h2 id="receipt-title" className="receipt__title">
        Danke. Ihre Angaben sind <em>eingegangen.</em>
      </h2>
      <p className="receipt__lede">
        Vorgangsnummer <code className="receipt__id">{result.id}</code>
        <br />
        Eine Kopie geht an <strong>{v.email}</strong>.
      </p>

      <dl className="receipt__list">
        <div>
          <dt>Halter</dt>
          <dd>
            {v.firstName} {v.lastName}
          </dd>
        </div>
        <div>
          <dt>Anschrift</dt>
          <dd>
            {v.street}, {v.zip} {v.city}
          </dd>
        </div>
        <div>
          <dt>FIN</dt>
          <dd className="mono">{v.vin}</dd>
        </div>
        <div>
          <dt>Kennzeichen</dt>
          <dd>
            <PlateView district={v.plateDistrict} letters={v.plateLetters} number={v.plateNumber} size="sm" />
          </dd>
        </div>
        <div>
          <dt>Sicherheitscodes</dt>
          <dd>
            {codesGiven} von {codesTotal} erfasst
          </dd>
        </div>
      </dl>

      <div className="receipt__next">
        <h3>So geht es weiter</h3>
        <ol>
          <li>Wir prüfen Ihre Angaben auf Plausibilität.</li>
          <li>Wir ermitteln die zuständige Zulassungsbehörde.</li>
          <li>Sie erhalten per E-Mail den Link zur Zahlung.</li>
        </ol>
      </div>

      <button type="button" className="btn-ghost" onClick={onReset}>
        Weiteres Fahrzeug abmelden
      </button>
    </section>
  );
}
