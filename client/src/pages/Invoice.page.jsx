import { Flex, Heading, Card, Text, Link, Separator} from "@radix-ui/themes"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { get } from "../api/invoice.api"


function InvoicePage() {
    const { id } = useParams()
    const [invoice, setInvoice] = useState(null)
     
    useEffect(() => {
        const fetchData = async () => setInvoice(await get(id))
        fetchData()
    }, [id])

    return (
        <Flex className="Form" direction="column" gap="5" style={{ maxWidth: 1024, margin: "40px auto", padding: 20 }}>
            <Heading size="6">Der Antrag wurde erfolgreich übermittelt.</Heading>

            <Card>
                <Flex direction="column" gap="3">
                    <Text>
                        <p><b>Vollständiger Name des Eigentümers:</b> {invoice?.ownerName}</p>
                        <p><b>Kennzeichen:</b> {invoice?.Number}</p>
                        <p><b>Antragsnummer:</b> {invoice?.adNumber}</p>
                    </Text>
                </Flex>
                {/* <Separator orientation="horizontal" mt="2" mb="2" style={{ width: "100%" }} /> */}
                <Flex direction="column" gap="3">
                    <Text>
                        <p>Ihr Fahrzeug wurde erfolgreich abgemeldet.</p>
                        <p>Die Abmeldebescheinigung erhalten Sie in Kürze per E-Mail <Link href={``}>{invoice?.email}</Link></p>
                    </Text>
                </Flex>
            </Card>
        </Flex>
    )
}


export default InvoicePage