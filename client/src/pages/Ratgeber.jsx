import { KOSTEN_PATH, FAQ_PATH } from '../../../shared/legal.js';
import { LegalLayout, makeSection } from '../components/LegalLayout.jsx';

const TOC = [
  ['so-gehts', 'So funktioniert es'],
  ['schritte', 'In 3 Schritten'],
  ['brauchen', 'Was Sie brauchen'],
  ['voraussetzungen', 'Voraussetzungen'],
  ['dauer', 'Dauer und Gültigkeit'],
];
const Section = makeSection(TOC);

export default function Ratgeber() {
  return (
    <LegalLayout
      kicker="Ratgeber"
      title="Auto online"
      emphasis="abmelden."
      toc={TOC}
      draft={false}
      meta={<><span className="dot" /> i-Kfz · Außerbetriebsetzung</>}
      docTitle="Auto online abmelden – so funktioniert es"
      docSub="Fahrzeug außer Betrieb setzen, ohne zur Zulassungsstelle zu fahren."
      lede="Sie möchten Ihr Fahrzeug abmelden, ohne Termin und ohne Behördengang? Mit AutoAbmeldung setzen Sie Ihr Auto online außer Betrieb – über das offizielle i-Kfz-Verfahren der Zulassungsbehörde."
    >
      <Section id="so-gehts">
        <p>
          Sie geben Ihre Daten und die Sicherheitscodes ein, wir stellen den Antrag bei der zuständigen Behörde. Die
          Abmeldung ist sofort nach Abschluss rechtsgültig, und Sie erhalten den amtlichen Bescheid als PDF.
        </p>
      </Section>

      <Section id="schritte">
        <ol className="doc__list">
          <li>
            <strong>Daten eingeben</strong> – Halter, Kennzeichen und FIN. Ein Foto der Zulassungsbescheinigung Teil II
            genügt, wir lesen die Felder automatisch aus.
          </li>
          <li>
            <strong>Sicherheitscodes freilegen</strong> – den Code auf der Zulassungsbescheinigung Teil I und die Codes
            unter den Stempelplaketten auf beiden Kennzeichen.
          </li>
          <li>
            <strong>Absenden</strong> – wir erledigen die Abmeldung und senden Ihnen den Bescheid.
          </li>
        </ol>
      </Section>

      <Section id="brauchen">
        <ul className="doc__list">
          <li>Zulassungsbescheinigung <strong>Teil I</strong> mit freigelegtem Sicherheitscode (Rückseite).</li>
          <li>Die <strong>Stempelplaketten</strong> auf vorderem und hinterem Kennzeichen (Code darunter freirubbeln).</li>
          <li>Die <strong>FIN</strong> (Fahrzeug-Identifizierungsnummer, Feld E).</li>
          <li>Bei Verschrottung zusätzlich den Code der Zulassungsbescheinigung <strong>Teil II</strong> und den Verwertungsnachweis.</li>
        </ul>
        <p className="doc__notice">
          <strong>Wichtig:</strong> Die Codes erst freilegen, wenn Sie wirklich abmelden – ein freigerubbeltes Etikett
          macht das Dokument ungültig.
        </p>
      </Section>

      <Section id="voraussetzungen">
        <p>
          Die Online-Abmeldung ist möglich für Fahrzeuge, die <strong>seit dem 1. Januar 2015</strong> zugelassen
          wurden – nur diese haben die nötigen Sicherheitscodes. Nicht möglich ist sie bei einer Auskunftssperre im
          Register.
        </p>
      </Section>

      <Section id="dauer">
        <p>
          Der Antrag wird in der Regel in wenigen Minuten bearbeitet; die Abmeldung ist sofort wirksam. Was der Service
          kostet, lesen Sie unter <a href={KOSTEN_PATH}>Kosten</a>. Weitere Fragen beantwortet die{' '}
          <a href={FAQ_PATH}>FAQ</a>.
        </p>
      </Section>
    </LegalLayout>
  );
}
