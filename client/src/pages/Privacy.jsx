import { IMPRESSUM_PATH, PRIVACY_STAND, PRIVACY_VERSION } from '../../../shared/legal.js';
import { LegalLayout, Todo, makeSection } from '../components/LegalLayout.jsx';

/*
 * Datenschutzhinweise nach Art. 13 DSGVO.
 * Жёлтые <Todo> — данные, которые знает только владелец сервиса (реквизиты, подрядчики, сроки).
 * Перед запуском: заполнить и дать проверить юристу. При изменении текста — поднять PRIVACY_VERSION.
 */

const TOC = [
  ['verantwortlicher', 'Verantwortlicher'],
  ['daten', 'Welche Daten'],
  ['zwecke', 'Zwecke und Rechtsgrundlagen'],
  ['empfaenger', 'Empfänger'],
  ['drittland', 'Drittländer'],
  ['speicherdauer', 'Speicherdauer'],
  ['cookies', 'Cookies und Tracking'],
  ['pflicht', 'Pflicht zur Angabe'],
  ['rechte', 'Ihre Rechte'],
  ['sicherheit', 'Sicherheit'],
  ['aenderungen', 'Änderungen'],
];

const Section = makeSection(TOC);

export default function Privacy() {
  return (
    <LegalLayout
      kicker="Datenschutz"
      title="Ihre Daten,"
      emphasis="klar geregelt."
      toc={TOC}
      meta={`Stand: ${PRIVACY_STAND}`}
      docTitle="Datenschutzhinweise"
      docSub="Informationen nach Art. 13 DSGVO zur Online-Abmeldung über AutoFaren"
      lede="Wir verarbeiten nur die Angaben, die für die Abmeldung Ihres Fahrzeugs nötig sind – und nur so lange, wie es dafür oder gesetzlich erforderlich ist. Hier steht, welche Daten das sind, wofür wir sie nutzen, an wen sie gehen und welche Rechte Sie haben."
    >
      <Section id="verantwortlicher">
        <p>Verantwortlich für die Datenverarbeitung im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
        <address className="doc__address">
          <Todo>Name bzw. Firma</Todo>
          <br />
          <Todo>Straße und Hausnummer</Todo>
          <br />
          <Todo>PLZ und Ort</Todo>
          <br />
          E-Mail: <Todo>datenschutz@…</Todo>
          <br />
          Telefon: <Todo>Telefonnummer</Todo>
        </address>
        <p>
          Datenschutzbeauftragter: <Todo>Kontaktdaten, falls benannt – sonst diesen Absatz streichen</Todo>
        </p>
        <p>
          Weitere Angaben zum Anbieter finden Sie im <a href={IMPRESSUM_PATH}>Impressum</a>.
        </p>
      </Section>

      <Section id="daten">
        <ul className="doc__list">
          <li>
            <strong>Kontaktdaten:</strong> Ihre E-Mail-Adresse.
          </li>
          <li>
            <strong>Halterdaten:</strong> Name, Vorname(n) und Anschrift, wie sie in der Zulassungsbescheinigung
            Teil II stehen.
          </li>
          <li>
            <strong>Fahrzeugdaten:</strong> Fahrzeug-Identifizierungsnummer (FIN) und amtliches Kennzeichen.
          </li>
          <li>
            <strong>Sicherheitscodes:</strong> der Code der Zulassungsbescheinigung Teil I und die Codes der
            Stempelplaketten auf beiden Kennzeichen; bei Verschrottung zusätzlich der Code der Zulassungsbescheinigung
            Teil II.
          </li>
          <li>
            <strong>Verbleib des Fahrzeugs:</strong> ob das Fahrzeug nur abgemeldet oder verschrottet wurde, ggf. Wunsch
            nach Kennzeichenreservierung, bei Verschrottung Datum und Staat der Verwertung sowie die Betriebsnummer des
            Demontagebetriebs.
          </li>
          <li>
            <strong>Foto der Zulassungsbescheinigung Teil II</strong> – nur wenn Sie die Fotofunktion nutzen. Daraus
            lesen wir FIN, Halterdaten und Kennzeichen aus. Auf dem Foto können weitere Angaben sichtbar sein, etwa
            frühere Halter oder technische Fahrzeugdaten; diese verwenden wir nicht.
          </li>
          <li>
            <strong>Vorgangsdaten:</strong> Vorgangsnummer, Zeitpunkt und Status des Antrags, der Bescheid der
            Zulassungsbehörde, die Rechnung sowie Ihre Bestätigung, dass Sie diese Hinweise erhalten haben (mit
            Zeitpunkt und Fassung).
          </li>
          <li>
            <strong>Zahlungsdaten:</strong> Zahlungsstatus und Transaktionsreferenz. Karten- oder Kontodaten
            verarbeitet ausschließlich der Zahlungsdienstleister.
          </li>
          <li>
            <strong>Zugriffsdaten:</strong> Beim Aufruf der Website verarbeitet unser Hosting-Anbieter technisch
            notwendige Daten – IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, übertragene Datenmenge, Browser und
            Betriebssystem.
          </li>
        </ul>
      </Section>

      <Section id="zwecke">
        <dl className="basis">
          <div>
            <dt>
              Durchführung der Abmeldung: Prüfung Ihrer Angaben, Ermittlung der zuständigen Zulassungsbehörde,
              Antrag im i-Kfz-Portal der Behörde, Zahlung der Gebühr, Zustellung des Bescheids und Kommunikation mit
              Ihnen
            </dt>
            <dd>Art. 6 Abs. 1 lit. b DSGVO – Vertrag und vorvertragliche Maßnahmen</dd>
          </div>
          <div>
            <dt>
              Auslesen des Fotos der Zulassungsbescheinigung Teil II, damit Sie die Angaben nicht abtippen müssen
              (freiwillig – alle Felder lassen sich auch von Hand ausfüllen)
            </dt>
            <dd>Art. 6 Abs. 1 lit. b DSGVO – vorvertragliche Maßnahme auf Ihre Anfrage</dd>
          </div>
          <div>
            <dt>Rechnungsstellung und Aufbewahrung von Buchungsbelegen</dt>
            <dd>Art. 6 Abs. 1 lit. c DSGVO i. V. m. § 147 AO, § 257 HGB</dd>
          </div>
          <div>
            <dt>Nachweis, dass Sie diese Hinweise erhalten haben</dt>
            <dd>Art. 6 Abs. 1 lit. f DSGVO – berechtigtes Interesse an der Nachweisbarkeit</dd>
          </div>
          <div>
            <dt>Sicherer und stabiler Betrieb der Website (Zugriffsdaten)</dt>
            <dd>Art. 6 Abs. 1 lit. f DSGVO – berechtigtes Interesse an Fehleranalyse und Abwehr von Angriffen</dd>
          </div>
        </dl>
        <p className="doc__notice">
          <strong>Keine Einwilligung nötig.</strong> Die Verarbeitung ist erforderlich, um Ihren Auftrag
          auszuführen. Mit dem Häkchen im Formular bestätigen Sie nur, dass Sie diese Hinweise erhalten haben.
        </p>
      </Section>

      <Section id="empfaenger">
        <ul className="doc__list">
          <li>
            <strong>Zuständige Zulassungsbehörde:</strong> Über ihr i-Kfz-Portal übermitteln wir in Ihrem Auftrag
            Kennzeichen, FIN, Sicherheitscodes und die weiteren Angaben, die das Portal für die Außerbetriebsetzung
            verlangt.
          </li>
          <li>
            <strong>Zahlungsdienstleister:</strong> <Todo>Name und Sitz</Todo> – für die Zahlung unseres
            Servicepreises. Die Gebühr der Behörde zahlen wir über deren Bezahlverfahren.
          </li>
          <li>
            <strong>Technische Dienstleister</strong> als Auftragsverarbeiter nach Art. 28 DSGVO, an unsere Weisungen
            gebunden: Hosting <Todo>Anbieter und Sitz</Todo>, E-Mail-Versand Brevo (Sendinblue SAS, Paris, Frankreich).
          </li>
          <li>
            <strong>OpenAI</strong> (OpenAI Ireland Ltd., Dublin, Irland; Verarbeitung auch durch OpenAI, L.L.C., USA)
            als Auftragsverarbeiter – nur wenn Sie die Fotofunktion nutzen: Das Foto wird zum Auslesen der Felder an
            die OpenAI-API übermittelt. OpenAI verwendet über die API übermittelte Daten nicht zum Training seiner
            Modelle und speichert sie höchstens 30 Tage zur Missbrauchserkennung.{' '}
            <Todo>Auftragsverarbeitungsvertrag (DPA) mit OpenAI abschließen</Todo>
          </li>
          <li>
            <strong>Telegram</strong> (Telegram FZ-LLC, Dubai, VAE) – für die interne Benachrichtigung unseres
            Bearbeitungsteams: Ihre Auftragsdaten und ggf. das Foto der Zulassungsbescheinigung werden an eine
            geschlossene Gruppe unseres Teams übermittelt.{' '}
            <Todo>rechtlich prüfen: Drittland ohne Angemessenheitsbeschluss – Alternative im EU-Raum erwägen</Todo>
          </li>
          <li>
            <strong>Behörden</strong>, soweit wir gesetzlich dazu verpflichtet sind, etwa Finanzbehörden.
          </li>
        </ul>
        <p>Wir verkaufen keine Daten und geben sie nicht zu Werbezwecken weiter.</p>
      </Section>

      <Section id="drittland">
        <p>
          Wir verarbeiten Ihre Daten grundsätzlich in der Europäischen Union.{' '}
          <Todo>gilt nur, wenn Hosting, E-Mail und Zahlung in der EU/im EWR verarbeiten – prüfen</Todo>
        </p>
        <p>
          <strong>Ausnahme Fotofunktion:</strong> Wenn Sie ein Foto der Zulassungsbescheinigung hochladen, kann es
          bei OpenAI auch in den USA verarbeitet werden. Grundlage ist der Angemessenheitsbeschluss der
          EU-Kommission zum EU-US Data Privacy Framework (Art. 45 DSGVO), unter dem OpenAI zertifiziert ist, sowie
          ergänzend die EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO). Wenn Sie das nicht möchten,
          füllen Sie das Formular einfach von Hand aus.
        </p>
      </Section>

      <Section id="speicherdauer">
        <ul className="doc__list">
          <li>
            <strong>Sicherheitscodes</strong> löschen wir, sobald die Abmeldung abgeschlossen ist oder endgültig
            nicht durchgeführt werden kann, spätestens nach <Todo>30 Tagen</Todo>. Nach der Abmeldung sind die Codes
            ohnehin verbraucht.
          </li>
          <li>
            <strong>Fotos der Zulassungsbescheinigung</strong> legen wir nicht in unserer Datenbank ab: Sie bleiben
            höchstens zwei Stunden im Arbeitsspeicher, bis Sie den Auftrag absenden, und werden dann an unser
            Bearbeitungsteam übermittelt (siehe Empfänger). Bei OpenAI höchstens 30 Tage.
          </li>
          <li>
            <strong>Halter-, Fahrzeug- und Vorgangsdaten</strong> speichern wir bis zum Abschluss des Vorgangs und
            danach bis zum Ablauf der Verjährung möglicher Ansprüche aus dem Auftrag (regelmäßig drei Jahre,
            § 195 BGB).
          </li>
          <li>
            <strong>Rechnungen und andere Buchungsbelege</strong> bewahren wir nach den gesetzlichen Fristen auf
            (§ 147 AO, § 257 HGB) – derzeit acht Jahre.
          </li>
          <li>
            <strong>Zugriffsdaten</strong> werden nach <Todo>7 Tagen</Todo> gelöscht, sofern sie nicht zur Aufklärung
            eines Sicherheitsvorfalls benötigt werden.
          </li>
        </ul>
      </Section>

      <Section id="cookies">
        <p>
          Diese Website setzt keine Cookies und keine Analyse-, Tracking- oder Werbewerkzeuge ein. Schriftarten und
          alle übrigen Inhalte laden wir von unserem eigenen Server – es entsteht keine Verbindung zu Drittanbietern
          wie Google. Ihre Eingaben im Formular werden erst übertragen, wenn Sie es absenden.
        </p>
      </Section>

      <Section id="pflicht">
        <p>
          Die Angaben im Formular sind für die Abmeldung erforderlich. Ohne sie können wir den Auftrag nicht
          ausführen; eine gesetzliche Pflicht zur Angabe besteht nicht.
        </p>
        <p>
          Eine automatisierte Entscheidung im Einzelfall einschließlich Profiling (Art. 22 DSGVO) findet nicht
          statt. Über die Außerbetriebsetzung entscheidet die Zulassungsbehörde.
        </p>
      </Section>

      <Section id="rechte">
        <p>Sie haben jederzeit das Recht auf</p>
        <ul className="doc__list doc__list--rights">
          <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO),</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
          <li>Löschung, soweit keine Aufbewahrungspflicht entgegensteht (Art. 17 DSGVO),</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
          <li>
            Beschwerde bei einer Datenschutz-Aufsichtsbehörde (Art. 77 DSGVO), etwa in dem Bundesland, in dem Sie
            wohnen, oder bei der für uns zuständigen Behörde: <Todo>Aufsichtsbehörde am Sitz, z. B. LDI NRW</Todo>.
          </li>
        </ul>
        <p>
          Eine formlose Nachricht an <Todo>E-Mail-Adresse</Todo> genügt.
        </p>

        <div className="doc__objection" role="note">
          <h4>Widerspruchsrecht nach Art. 21 DSGVO</h4>
          <p>
            Soweit wir Daten auf Grundlage berechtigter Interessen verarbeiten (Art. 6 Abs. 1 lit. f DSGVO), können
            Sie aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit widersprechen. Wir
            verarbeiten die Daten dann nicht mehr, es sei denn, wir können zwingende schutzwürdige Gründe
            nachweisen, die Ihre Interessen überwiegen, oder die Verarbeitung dient der Geltendmachung, Ausübung
            oder Verteidigung von Rechtsansprüchen.
          </p>
        </div>
      </Section>

      <Section id="sicherheit">
        <p>
          Die Verbindung zu dieser Website ist TLS-verschlüsselt. Zugriff auf Ihre Angaben haben nur Personen, die
          sie für die Bearbeitung Ihres Auftrags benötigen.
        </p>
      </Section>

      <Section id="aenderungen">
        <p>
          Wir passen diese Hinweise an, wenn sich unser Angebot oder die Rechtslage ändert. Es gilt die jeweils hier
          veröffentlichte Fassung.
        </p>
        <p className="doc__stand">
          Stand: {PRIVACY_STAND} · Fassung {PRIVACY_VERSION}
        </p>
      </Section>
    </LegalLayout>
  );
}
