import { Card, Text, Button, Flex, TextField, Heading, Separator } from "@radix-ui/themes"
import { useState } from "react"
import PhotoLoader from "./Photo"
import zb1 from '../assets/ZBI.png'
import { parseZBI } from '../api/invoice.api'


function ZBI({ onComplite, email }) {
    const [hide, setHide] = useState(false)
    const [upload, setUpload] = useState(false)

    const [code, setCode] = useState("")

    const [isExample, setIsExample] = useState(false)
    const toggleExample = () => { setIsExample((prew) => !prew) }
    
    
    const parseData = async (file) => {
        const res = await parseZBI(file, email)
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
            <Heading size="4">Zulassungsbescheinigung Teil I</Heading>

            {!hide && <Flex direction="column" gap="2">
                {isExample && (
                    <Card className="example">
                        <Flex direction="column" gap="2">
                            <img className="example-img" src={zb1} alt="preview" />
                            <Text size="1" style={{ marginTop: 6 }}>
                                Für die Zulassungsbescheinigung Teil I (ZB I) ist ein vollständiges und gut lesbares Foto erforderlich. 
                                Die aufgeklebte Plakette muss zuvor abgezogen werden, sodass der darunterliegende Code klar sichtbar ist.
                            </Text>
                        </Flex>
                    </Card>
                )}
                <Button size="6" mt="10" onClick={toggleExample}>{isExample ? 'Beispiel ausblenden' : 'Beispiel'}</Button>
                <Separator orientation="horizontal" mt="2" mb="2" style={{ width: "100%" }} />
                <PhotoLoader id="ZBI" onSubmit={(file) => parseData(file)} />
            </Flex>}

            <TextField.Root disabled={hide} placeholder="Zulassungsbescheinigung Teil I aber Teil II (unter dem Aufkleber, kleines Blatt)" name="zb1Code" value={code} onChange={(e) => setCode(e.target.value)} />
            {(!hide && upload) && <Button size="6" mt="10" onClick={handleComplite}>Bestätigen</Button>}
        </Flex>
    )
}


export default ZBI
