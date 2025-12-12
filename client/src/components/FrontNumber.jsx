import { Card, Text, Button, Flex, TextField, Heading, Separator } from "@radix-ui/themes"
import { useState } from "react"
import PhotoLoader from "./Photo"
import { parseFront } from '../api/invoice.api'
import front from '../assets/back.jpg'


function FrontNumber({ onComplite, email }) {
    const [hide, setHide] = useState(false)
    const [upload, setUpload] = useState(false)

    const [code, setCode] = useState("")

    const [isExample, setIsExample] = useState(false)
    const toggleExample = () => { setIsExample((prew) => !prew) }


    const parseData = async (file) => {
        const res = await parseFront(file, email)
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
            <Heading size="4">Vorderes Kennzeichen</Heading>

            {!hide && <Flex direction="column" gap="2">
                {isExample && (
                    <Card className="example">
                        <Flex direction="column" gap="2">
                            <img className="example-img" src={front} alt="preview" />
                            <Text size="1" style={{ marginTop: 6 }}>
                                Für das Foto des vorderen Nummernschildes ist darauf zu achten, dass die runde Plakette sichtbar ist. 
                                Der geheime Code aus drei Buchstaben befindet sich unter dieser runden Plakette und muss auf dem Foto erkennbar sein.
                            </Text>
                        </Flex>
                    </Card>
                )}
                <Button size="6" mt="10" onClick={toggleExample}>{isExample ? 'Beispiel ausblenden' : 'Beispiel'}</Button>
                <Separator orientation="horizontal" mt="2" mb="2" style={{ width: "100%" }} />
                <PhotoLoader id="Front" onSubmit={(file) => parseData(file)} />
            </Flex>}

            <TextField.Root disabled={hide} placeholder="Code (unter dem Aufkleber)" name="frontCode" value={code} onChange={(e) => setCode(e.target.value)} />            
            {(!hide && upload) && <Button size="6" mt="10" onClick={handleComplite}>Bestätigen</Button>}
        </Flex>
    )
}


export default FrontNumber
