import { Card, Text, Button, Flex, TextField, Heading, Separator } from "@radix-ui/themes"
import { useState } from "react"
import PhotoLoader from "./Photo"
import back from '../assets/back.jpg'
import { parseBack } from '../api/invoice.api'


function BackNumber({ onComplite, email }) {
    const [hide, setHide] = useState(false)
    const [upload, setUpload] = useState(false)

    const [code, setCode] = useState("")

    const [isExample, setIsExample] = useState(false)
    const toggleExample = () => { setIsExample((prew) => !prew) }


    const parseData = async (file) => {
        const res = await parseBack(file, email)
        if(!res.ok) { console.log("error") }

        const data = res.data

        if(data.code) { setCode(data.code) }

        setUpload(true)
    }
    
    const handleComplite = () => {
        setHide(true)
        onComplite({ code })
    }


    return (
        <Flex direction="column" gap="3" mt="4">
            <Heading size="4">Kennzeichen hinten</Heading>
            {!hide && <Flex direction="column" gap="2">
                {isExample && (
                    <Card className="example">
                        <Flex direction="column" gap="2">
                            <img className="example-img" src={back} alt="preview" />
                            <Text size="1" style={{ marginTop: 6 }}>
                                Es ist erforderlich, ein Foto des großen Fahrzeugscheins (Zulassungsbescheinigung Teil II – ZB II) hochzuladen,
                                sodass alle Daten sichtbar sind, insbesondere die letzte Spalte sowie die Fahrzeug-Identifizierungsnummer (FIN/VIN), wie im Beispiel.
                            </Text>
                        </Flex>
                    </Card>
                )}
                <Button size="6" mt="10" onClick={toggleExample}>{isExample ? 'Beispiel ausblenden' : 'Beispiel'}</Button>
                <Separator orientation="horizontal" mt="2" mb="2" style={{ width: "100%" }} />
                <PhotoLoader id="Back" onSubmit={(file) => parseData(file)} />
            </Flex>}

            <TextField.Root disabled={hide} placeholder="Code (unter dem Aufkleber)" name="rearCode" value={code} onChange={(e) => setCode(e.target.value)} />
            {(!hide && upload) && <Button size="6" mt="10" onClick={handleComplite}>Bestätigen</Button>}
        </Flex>
    )
}


export default BackNumber
