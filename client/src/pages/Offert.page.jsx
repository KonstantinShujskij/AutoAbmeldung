import { Button, Flex, Heading, Card, Text, Link } from "@radix-ui/themes"


function OffertPage() {   
    return (
        <Flex className="Form" direction="column" gap="5" style={{ maxWidth: 1024, margin: "40px auto", padding: 20 }}>
            <Heading size="6">Öffentliches Angebot (Vertragsofferte)</Heading>

            <Card>
                <Flex direction="column" gap="3">
                    <Text>
                        Diese öffentliche Offerte stellt ein verbindliches Angebot zum Abschluss eines Vertrages gemäß § 145 BGB dar 
                        und regelt die Bedingungen für die Erbringung von Dienstleistungen zur Abmeldung eines Kraftfahrzeugs in der 
                        Bundesrepublik Deutschland. Anbieter der Dienstleistung ist [Name des Unternehmens / Einzelunternehmers], [Adresse], 
                        E-Mail: [E-Mail], Telefon: [Telefon], Steuernummer / USt-IdNr.: [Nummer]. 
                        Gegenstand dieses Vertrages ist die entgeltliche Durchführung der Abmeldung eines Kraftfahrzeugs bei der zuständigen deutschen Zulassungsstelle auf Grundlage der vom Kunden zur Verfügung 
                        gestellten Unterlagen. Der Vertrag kommt zustande, sobald der Kunde über die Website eine Bestellung aufgibt und diese durch den Anbieter 
                        bestätigt wird oder die Zahlung der Dienstleistung erfolgt. Der Kunde verpflichtet sich, dem Anbieter vollständige, 
                        korrekte und aktuelle Informationen sowie alle erforderlichen Dokumente (z. B. Zulassungsbescheinigung Teil I und II, Kennzeichen, Vollmacht) rechtzeitig zur Verfügung zu stellen. 
                        Der Anbieter übernimmt keine Verantwortung für Verzögerungen oder die Unmöglichkeit der Leistungserbringung, die auf unvollständige oder fehlerhafte Angaben des Kunden zurückzuführen sind. 
                        Die Dienstleistung gilt als erbracht, sobald das Fahrzeug ordnungsgemäß bei der zuständigen Zulassungsstelle abgemeldet wurde. 
                        Die Bearbeitungsdauer kann je nach Behörde variieren und stellt keine verbindliche Frist dar. Die Preise ergeben sich aus den auf der Website angegebenen Informationen und verstehen sich inklusive aller anwendbaren Steuern, 
                        sofern nicht anders angegeben. Die Zahlung erfolgt im Voraus über die auf der Website angebotenen Zahlungsmethoden. 
                        Ein Widerrufsrecht besteht gemäß § 356 Abs. 4 BGB nicht, sofern der Anbieter die Dienstleistung vollständig erbracht hat und der Kunde vor Vertragsabschluss ausdrücklich zugestimmt hat, 
                        dass mit der Ausführung der Dienstleistung vor Ablauf der Widerrufsfrist begonnen wird. Der Anbieter haftet nur für Vorsatz und grobe Fahrlässigkeit; bei leichter Fahrlässigkeit nur bei Verletzung wesentlicher Vertragspflichten. 
                        Für indirekte Schäden, Folgeschäden oder entgangenen Gewinn wird keine Haftung übernommen. Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist, soweit gesetzlich zulässig, der Sitz des Anbieters.
                    </Text>
                </Flex>
            </Card>
        </Flex>
    )
}


export default OffertPage
