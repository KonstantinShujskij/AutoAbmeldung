import { PRIVACY_PATH } from '../../../shared/legal.js';
import { LegalLayout, makeSection } from '../components/LegalLayout.jsx';

/*
 * Impressum nach § 5 DDG (Digitale-Dienste-Gesetz, заменил § 5 TMG с 14.05.2024).
 * Данные владельца: Denys Ishkov (Einzelunternehmer, X9), совпадают с robots-x9.de/impressum.
 * Ссылка на EU-OS-Plattform не нужна: платформа закрыта 20.07.2025 (VO (EU) 2024/3228).
 */

const TOC = [
  ['anbieter', 'Anbieter'],
  ['kontakt', 'Kontakt'],
  ['steuern', 'Steuern und Aufsicht'],
  ['inhalt', 'Verantwortlich für den Inhalt'],
  ['streitbeilegung', 'Verbraucherstreitbeilegung'],
  ['haftung', 'Haftung für Inhalte und Links'],
  ['urheberrecht', 'Urheberrecht'],
  ['hinweis', 'Hinweis zum Angebot'],
];

const Section = makeSection(TOC);

export default function Impressum() {
  return (
    <LegalLayout
      kicker="Impressum"
      title="Wer hinter"
      emphasis="AutoAbmeldung steht."
      toc={TOC}
      meta="Angaben gemäß § 5 DDG"
      docTitle="Impressum"
      docSub="Anbieterkennzeichnung nach § 5 Digitale-Dienste-Gesetz (DDG)"
      draft={false}
    >
      <Section id="anbieter">
        <address className="doc__address">
          Denys Ishkov
          <br />
          X9 – Präzise Lösungen für komplexe Systeme
          <br />
          Bismarckstraße 45
          <br />
          52066 Aachen
          <br />
          Deutschland
        </address>
      </Section>

      <Section id="kontakt">
        <dl className="doc__facts">
          <div>
            <dt>Telefon</dt>
            <dd>+49 (0) 160 3729656</dd>
          </div>
          <div>
            <dt>E-Mail</dt>
            <dd>denys.ishkov@gmail.com</dd>
          </div>
        </dl>
      </Section>

      <Section id="steuern">
        <dl className="doc__facts">
          <div>
            <dt>Umsatzsteuer-ID</dt>
            <dd>
              Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:
              <br />
              DE465528015
            </dd>
          </div>
          <div>
            <dt>Aufsichtsbehörde</dt>
            <dd>Stadt Aachen</dd>
          </div>
        </dl>
      </Section>

      <Section id="inhalt">
        <p>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:</p>
        <address className="doc__address">
          Denys Ishkov
          <br />
          Bismarckstraße 45
          <br />
          52066 Aachen
        </address>
      </Section>

      <Section id="streitbeilegung">
        <p>
          Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </Section>

      <Section id="haftung">
        <p>
          <strong>Haftung für Inhalte.</strong> Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten
          nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder
          gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
          Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
          allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist erst ab dem Zeitpunkt der
          Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen
          entfernen wir diese Inhalte umgehend.
        </p>
        <p>
          <strong>Haftung für Links.</strong> Unser Angebot enthält Links zu externen Websites Dritter, auf deren
          Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
          übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten
          verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
          überprüft; rechtswidrige Inhalte waren nicht erkennbar. Bei Bekanntwerden von Rechtsverletzungen entfernen
          wir solche Links umgehend.
        </p>
      </Section>

      <Section id="urheberrecht">
        <p>
          Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
          Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
          Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit
          die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet
          und als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden,
          bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen entfernen wir solche
          Inhalte umgehend.
        </p>
      </Section>

      <Section id="hinweis">
        <p>
          AutoAbmeldung ist ein privater Dienstleister und keine Behörde. Wir stellen Anträge auf Außerbetriebsetzung in
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
