import { Button, Flex, TextField, Heading } from "@radix-ui/themes"
import { useState } from "react"


function Email({ onComplite }) {
    const [hide, setHide] = useState(false)
    const [email, setEmail] = useState("")

    const handleEmailChange = () => {
        setHide(email.length > 0)
        onComplite(email)
    }

    return (
        <Flex direction="column" gap="3" mt="4">
            <Heading size="4">Ihre E-Mail-Adresse</Heading>
            <TextField.Root disabled={hide} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" name="email" />
            {!hide && <Button size="2" mt="2" onClick={handleEmailChange}>Weiter</Button>}
        </Flex>
    )
}


export default Email
 