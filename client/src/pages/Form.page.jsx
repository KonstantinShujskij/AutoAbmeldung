import { Button, Flex, Heading, Card, Text, Link } from "@radix-ui/themes"
import FrontNumber from "../components/FrontNumber"
import BackNumber from "../components/BackNumber"
import ZBI from "../components/ZBI"
import ZBII from "../components/ZBII"
import { useState } from "react"
import Email from "../components/Email"
import { create, make } from "../api/invoice.api"


function FormPage() {
    const [email, setEmail] = useState(null)
    const [zbI, setZbI] = useState(null)
    const [zbII, setZbII] = useState(null)
    const [back, setBack] = useState(null)
    const [front, setFront] = useState(null)


    const handleComplite = async () => {
        const invoice = await create(email, zbI, zbII, back, front)
        if(invoice) {
            window.dataLayer = window.dataLayer || []
            window.dataLayer.push({ event: 'payment_success' })
            window.location.href = `/invoice/${invoice?._id}`
        }
    }

    const handleEmail = async (email) => {
        setEmail(email)
        await make(email)
    }

    return (
        <Flex className="Form" direction="column" gap="5" style={{ maxWidth: 1024, margin: "40px auto", padding: 20 }}>
            <Text style={{color: "#c3c3c3", fontSize: "12px" }}>
                HINWEIS: Wir sind ein privater Dienstleister und keine Behörde. Unsere Dienstleistung ist kostenpflichtig. 
                Die offizielle Abmeldung kann auch direkt über das i-Kfz Portal des Kraftfahrt-Bundesamtes vorgenommen werden.
            </Text>
            <Heading size="6">Abmeldung</Heading>
            <Card>
                <Flex direction="column" gap="3">
                    <Email onComplite={handleEmail} />
                    {email && <ZBII onComplite={setZbII} email={email} />}
                    {zbII && <ZBI onComplite={setZbI} email={email} /> }
                    {zbI && <FrontNumber onComplite={setFront} email={email} />}
                    {front && <BackNumber onComplite={setBack} email={email} />}

                    {back && <Button size="4" mt="4" onClick={() => handleComplite()}>Weiter</Button> }
                </Flex>
            </Card>

            <Flex direction="column">
                <Link href="./offerte" >Öffentliches Angebot</Link>
                <Link href="./daten" >Datenschutzerklärung</Link>
            </Flex>
        </Flex>
    )
}


export default FormPage
