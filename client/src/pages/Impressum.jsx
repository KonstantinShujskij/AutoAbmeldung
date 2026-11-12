import { PRIVACY_PATH } from '../../../shared/legal.js';
import { LegalLayout, Todo, makeSection } from '../components/LegalLayout.jsx';

/*
 * Impressum nach § 5 DDG (Digitale-Dienste-Gesetz, заменил § 5 TMG с 14.05.2024).
 * Жёлтые <Todo> — реквизиты владельца. Пункты с пометкой «falls …» удалить, если не относятся.
 * Ссылка на EU-OS-Plattform больше не нужна: платформа закрыта 20.07.2025 (VO (EU) 2024/3228).
 */

const TOC = [
  ['anbieter', 'Anbieter'],
  ['kontakt', 'Kontakt'],
  ['register', 'Register und Steuern'],
  ['inhalt', 'Verantwortlich für den Inhalt'],
  ['streitbeilegung', 'Verbraucherstreitbeilegung'],
  ['hinweis', 'Hinweis zum Angebot'],
];

const Section = makeSection(TOC);

export default function Impressum() {
  return (
    <LegalLayout
      kicker="Impressum"
      title="Wer hinter"
      emphasis="AutoFaren steht."
      toc={TOC}
      meta="Angaben gemäß § 5 DDG"
      docTitle="Impressum"
      docSub="Anbieterkennzeichnung nach § 5 Digitale-Dienste-Gesetz (DDG)"
    >
      <Section id="anbieter">
        <address className="doc__address">
          <Todo>Name bzw. Firma mit Rechtsform, z. B. „Max Muster“ oder „AutoFaren UG (haftungsbeschränkt)“</Todo>
          <br />
          <Todo>Straße und Hausnummer</Todo>
          <br />
          <Todo>PLZ und Ort</Todo>
          <br />
          Deutschland
        </address>
        <p>
          Vertreten durch: <Todo>Geschäftsführer/in – nur bei GmbH, UG o. Ä., sonst streichen</Todo>
        </p>
        <p className="doc__hint">
          Ein Postfach genügt nicht – nötig ist eine Anschrift, unter der Post zugestellt werden kann.
        </p>
      </Section>

      <Section id="kontakt">
        <dl className="doc__facts">
          <div>
            <dt>E-Mail</dt>
            <dd>
              <Todo>kontakt@…</Todo>
            </dd>
          </div>
          <div>
            <dt>Telefon</dt>
            <dd>
              <Todo>Telefonnummer</Todo>
            </dd>
          </div>
        </dl>
      </Section>

      <Section id="register">
        <dl className="doc__facts">
          <div>
            <dt>Handelsregister</dt>
            <dd>
              <Todo>Registergericht und HRB-Nummer – falls eingetragen, sonst streichen</Todo>
            </dd>
          </div>
          <div>
            <dt>Umsatzsteuer-ID</dt>
            <dd>
              <Todo>USt-IdNr. nach § 27a UStG – falls vorhanden, sonst streichen</Todo>
            </dd>
          </div>
          <div>
            <dt>Aufsichtsbehörde</dt>
            <dd>
              <Todo>nur falls die Tätigkeit eine behördliche Erlaubnis braucht – sonst streichen</Todo>
            </dd>
          </div>
        </dl>
      </Section>

      <Section id="inhalt">
        <p>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:</p>
        <address className="doc__address">
          <Todo>Name</Todo>
          <br />
          <Todo>Anschrift wie oben</Todo>
        </address>
        <p className="doc__hint">
          Nur nötig bei journalistisch-redaktionellen Inhalten, etwa einem Blog oder Ratgeber. Für ein reines
          Antragsformular kann dieser Abschnitt entfallen.
        </p>
      </Section>

      <Section id="streitbeilegung">
        <p>
          Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </Section>

      <Section id="hinweis">
        <p>
          AutoFaren ist ein privater Dienstleister und keine Behörde. Wir stellen Anträge auf Außerbetriebsetzung in
          Ihrem Auftrag über die i-Kfz-Portale der Zulassungsbehörden. Über den Antrag entscheidet allein die zuständige
          Zulassungsbehörde.
        </p>
        <p>
          Wie wir mit Ihren Daten umgehen, steht in den <a href={PRIVACY_PATH}>Datenschutzhinweisen</a>.
        </p>
      </Section>
    </LegalLayout>
  );
}
