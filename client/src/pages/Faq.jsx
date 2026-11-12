import { RATGEBER_PATH, KOSTEN_PATH } from '../../../shared/legal.js';
import { LegalLayout } from '../components/LegalLayout.jsx';

// Sichtbarer Text = Schema-Text (Voraussetzung für FAQ-Rich-Results).
const FAQ = [
  ['Kann ich mein Auto wirklich komplett online abmelden?',
    'Ja. Für Fahrzeuge, die seit 2015 zugelassen sind, ist die Außerbetriebsetzung über das offizielle i-Kfz-Verfahren vollständig online möglich – ohne Termin und ohne Gang zur Zulassungsstelle.'],
  ['Was brauche ich für die Abmeldung?',
    'Die Zulassungsbescheinigung Teil I mit freigelegtem Sicherheitscode, die Codes unter den Stempelplaketten beider Kennzeichen und die FIN. Bei Verschrottung zusätzlich den Code der Zulassungsbescheinigung Teil II.'],
  ['Wie lange dauert es?',
    'Der Antrag wird in der Regel in wenigen Minuten bearbeitet; die Abmeldung ist sofort nach Abschluss wirksam. Den Bescheid erhalten Sie als PDF.'],
  ['Brauche ich einen Personalausweis mit Online-Funktion (eID)?',
    'Nein. Für die Abmeldung ist keine eID nötig – die Sicherheitscodes genügen.'],
  ['Ist die Online-Abmeldung rechtsgültig?',
    'Ja, sie erfolgt über das offizielle Verfahren der Zulassungsbehörde und ist genauso gültig wie eine Abmeldung vor Ort.'],
  ['Mein Fahrzeug wurde verschrottet – geht das auch?',
    'Ja. Geben Sie dazu den Verwertungsnachweis (Datum, Staat, Betriebsnummer) und den Code der Zulassungsbescheinigung Teil II an.'],
  ['Sind meine Daten sicher?',
    'Ihre Daten werden ausschließlich zur Durchführung der Abmeldung verarbeitet, in der EU gehostet und nicht zu Werbezwecken weitergegeben. Details in der Datenschutzerklärung.'],
];

const TOC = FAQ.map(([q], i) => [`f${i}`, q.length > 30 ? q.slice(0, 28) + '…' : q]);

const schema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(([q, a]) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function Faq() {
  return (
    <LegalLayout
      kicker="Hilfe"
      title="Häufige"
      emphasis="Fragen."
      toc={TOC}
      draft={false}
      meta={<><span className="dot" /> Online-Abmeldung · FAQ</>}
      docTitle="Häufige Fragen zur Online-Abmeldung"
      docSub="Antworten rund um die Außerbetriebsetzung Ihres Fahrzeugs."
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {FAQ.map(([q, a], i) => (
        <section key={i} id={`f${i}`} className="doc__sec">
          <h3 id={`f${i}-h`}>{q}</h3>
          <p>{a}</p>
        </section>
      ))}
      <p>
        Mehr zum Ablauf im <a href={RATGEBER_PATH}>Ratgeber</a>, zum Preis unter <a href={KOSTEN_PATH}>Kosten</a>.
      </p>
    </LegalLayout>
  );
}
