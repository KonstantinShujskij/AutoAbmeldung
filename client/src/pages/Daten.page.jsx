import { Button, Flex, Heading, Card, Text, Link } from "@radix-ui/themes"


function DatenPage() {   
    return (
        <Flex className="Form" direction="column" gap="5" style={{ maxWidth: 1024, margin: "40px auto", padding: 20 }}>
            <Heading size="6">Datenschutzerklärung und Einwilligung zur Verarbeitung personenbezogener Daten</Heading>

            <Card>
                <Flex direction="column" gap="3">
                    <Text>
                        Der Schutz personenbezogener Daten hat für den Anbieter einen hohen Stellenwert. 
                        Diese Datenschutzerklärung erläutert Art, Umfang und Zweck der Verarbeitung personenbezogener Daten der Nutzer der Website gemäß der Datenschutz-Grundverordnung (DSGVO). 
                        Verantwortlicher für die Datenverarbeitung ist [Name des Unternehmens / Einzelunternehmers], [Adresse], E-Mail: [E-Mail], Telefon: [Telefon]. 
                        Personenbezogene Daten werden ausschließlich verarbeitet, soweit dies zur Erbringung der angebotenen Dienstleistungen, insbesondere zur Abmeldung eines Fahrzeugs bei der zuständigen Zulassungsstelle in Deutschland, erforderlich ist. 
                        Zu den verarbeiteten Daten gehören insbesondere Name, Vorname, Kontaktdaten (E-Mail-Adresse, Telefonnummer), Adressdaten, fahrzeugbezogene Daten (z. B. Kennzeichen, Fahrzeug-Identifikationsnummer), 
                        sowie übermittelte Dokumente. Die Verarbeitung der Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). 
                        Die personenbezogenen Daten werden nur an Dritte weitergegeben, soweit dies zur Vertragserfüllung notwendig ist, insbesondere an zuständige Behörden (Zulassungsstellen) oder Zahlungsdienstleister. 
                        Eine Weitergabe zu Werbezwecken erfolgt nicht. Die Daten werden nur so lange gespeichert, wie dies zur Erfüllung der vertraglichen und gesetzlichen Pflichten erforderlich ist. 
                        Nach Wegfall des Verarbeitungszwecks oder Ablauf gesetzlicher Aufbewahrungsfristen werden die Daten gelöscht. Der Nutzer hat jederzeit das Recht auf Auskunft über seine gespeicherten personenbezogenen Daten, 
                        das Recht auf Berichtigung unrichtiger Daten, das Recht auf Löschung, Einschränkung der Verarbeitung sowie das Recht auf Datenübertragbarkeit gemäß Art. 15–20 DSGVO. Darüber hinaus hat der Nutzer das Recht, eine erteilte Einwilligung zur Verarbeitung personenbezogener 
                        Daten jederzeit mit Wirkung für die Zukunft zu widerrufen. Der Widerruf berührt nicht die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung. Zudem besteht ein Beschwerderecht bei der zuständigen Datenschutzaufsichtsbehörde. 
                        Durch Nutzung der Website und/oder Absenden der Daten erklärt sich der Nutzer ausdrücklich mit der Verarbeitung seiner personenbezogenen Daten gemäß dieser Datenschutzerklärung einverstanden.
                    </Text>
                </Flex>
            </Card>
        </Flex>
    )
}


export default DatenPage
