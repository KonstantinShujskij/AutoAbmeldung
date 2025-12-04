import { Button, Flex, Heading, Card } from "@radix-ui/themes"
import FrontNumber from "../components/FrontNumber"
import BackNumber from "../components/BackNumber"
import ZBI from "../components/ZBI"
import ZBII from "../components/ZBII"
import { useState } from "react"
import Email from "../components/Email"


function FormPage() {
    const [email, setEmail] = useState(null)
    const [zbI, setZbI] = useState(null)
    const [zbII, setZbII] = useState(null)
    const [back, setBack] = useState(null)
    const [front, setFront] = useState(null)

    return (
        <Flex direction="column" gap="5" style={{ maxWidth: 1024, margin: "40px auto", padding: 20 }}>
            <Heading size="6">Abmeldung Ihres Fahrzeugs</Heading>

            <Card>
                <Flex direction="column" gap="3">
                    <Email onComplite={setEmail} />
                    {email && <ZBII onComplite={setZbII} />}
                    {zbII && <ZBI onComplite={setZbI} /> }
                    {zbI && <FrontNumber onComplite={setFront} />}
                    {front && <BackNumber onComplite={setBack} />}

                    {back && <Button size="4" mt="4">Weiter</Button> }
                </Flex>
            </Card>
        </Flex>
    )
}


export default FormPage
