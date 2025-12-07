import { Button, Flex, Heading, Card } from "@radix-ui/themes"
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
        const res = await create(email, zbI, zbII, back, front)
        console.log(res)
    }

    const handleEmail = async (email) => {
        setEmail(email)
        await make(email)
    }

    return (
        <Flex direction="column" gap="5" style={{ maxWidth: 1024, margin: "40px auto", padding: 20 }}>
            <Heading size="6">Abmeldung Ihres Fahrzeugs</Heading>

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
        </Flex>
    )
}


export default FormPage
