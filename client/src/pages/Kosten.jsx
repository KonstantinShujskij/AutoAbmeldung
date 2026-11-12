import { RATGEBER_PATH, FAQ_PATH } from '../../../shared/legal.js';
import { LegalLayout, makeSection, Todo } from '../components/LegalLayout.jsx';

const TOC = [
  ['preis', 'Was kostet es'],
  ['enthalten', 'Was enthalten ist'],
  ['warum', 'Warum ein Service'],
];
const Section = makeSection(TOC);

export default function Kosten() {
  return (
    <LegalLayout
      kicker="Preise"
      title="Was kostet die"
      emphasis="Abmeldung?"
      toc={TOC}
      draft={false}
      meta={<><span className="dot" /> Transparent, ein Festpreis</>}
      docTitle="Was kostet die Online-Abmeldung?"
      docSub="Ein Festpreis – inklusive der amtlichen Gebühr."
      lede={<>Die Online-Abmeldung kostet bei uns <strong><Todo>30&nbsp;€</Todo></strong> als Festpreis. Darin ist die amtliche Gebühr der Zulassungsbehörde bereits enthalten – es kommen keine weiteren Kosten hinzu.</>}
    >
      <Section id="preis">
        <dl className="basis">
          <div>
            <dt>Unser Service (Prüfung, Antrag im i-Kfz-Portal, Bescheid als PDF)</dt>
            <dd><Todo>enthalten</Todo></dd>
          </div>
          <div>
            <dt>Amtliche Gebühr der Zulassungsbehörde</dt>
            <dd><Todo>enthalten</Todo></dd>
          </div>
          <div>
            <dt>Gesamt</dt>
            <dd><strong><Todo>30&nbsp;€</Todo></strong></dd>
          </div>
        </dl>
      </Section>

      <Section id="enthalten">
        <ul className="doc__list">
          <li>Prüfung Ihrer Angaben und Ermittlung der zuständigen Behörde.</li>
          <li>Antrag auf Außerbetriebsetzung über das offizielle i-Kfz-Verfahren.</li>
          <li>Der amtliche Bescheid als PDF per E-Mail.</li>
        </ul>
      </Section>

      <Section id="warum">
        <p>
          Sie sparen sich den Gang zur Zulassungsstelle und die Wartezeit. Wie der Ablauf aussieht, lesen Sie im{' '}
          <a href={RATGEBER_PATH}>Ratgeber</a>; häufige Fragen beantwortet die <a href={FAQ_PATH}>FAQ</a>.
        </p>
      </Section>
    </LegalLayout>
  );
}
