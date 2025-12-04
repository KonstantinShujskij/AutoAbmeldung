import { Card, Text, Button, Flex, TextField, Heading, Separator } from "@radix-ui/themes"
import { useState } from "react"
import PhotoLoader from "./Photo"
import zb2 from '../assets/ZBII.webp'


function ZBII({ onComplite }) {
    const [hide, setHide] = useState(false)
    const [upload, setUpload] = useState(false)

    const [ownerName, setOwnerName] = useState("")
    const [ownerAddress, setOwnerAddress] = useState("")
    const [VIN, setVIN] = useState("")
    const [Number, setNumber] = useState("")

    const [isExample, setIsExample] = useState(false)
    const toggleExample = () => { setIsExample((prew) => !prew) }


    const parseData = async (file) => {
        console.log("parsing ZBII", file)

        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("http://127.0.0.1:5555/api/invoice/ZBII", { method: "POST", body: formData })

        if (!res.ok) { console.log("error") }
        const data = await res.json()

        if (data.fullName) { setOwnerName(data.fullName) }
        if (data.address) { setOwnerAddress(data.address) }
        if (data.VIN) { setVIN(data.VIN) }
        if (data.number) { setNumber(data.number) }

        setUpload(true)
    }

    const handleComplite = () => {
        setHide(true)
        onComplite(true)
    }


    return (
        <Flex direction="column" gap="3" mt="4">
            <Heading size="4">Zulassungsbescheinigung Teil II</Heading>

            {!hide && <Flex direction="column" gap="2">
                {isExample && (
                    <Card className="example">
                        <Flex direction="column" gap="2">
                            <img className="example-img" src={zb2} alt="preview" />
                            <Text size="1" style={{ marginTop: 6 }}>
                                Es ist erforderlich, ein Foto des großen Fahrzeugscheins (Zulassungsbescheinigung Teil II – ZB II) hochzuladen,
                                sodass alle Daten sichtbar sind, insbesondere die letzte Spalte sowie die Fahrzeug-Identifizierungsnummer (FIN/VIN), wie im Beispiel.
                            </Text>

                        </Flex>
                    </Card>
                )}
                <Button size="6" mt="10" onClick={toggleExample}>{isExample ? 'Beispiel ausblenden' : 'Beispiel'}</Button>
                <Separator orientation="horizontal" mt="2" mb="2" style={{ width: "100%" }} />
                <PhotoLoader id="ZBII" onSubmit={(file) => parseData(file)} />
            </Flex>}

            <Separator orientation="horizontal" mt="2" mb="2" style={{ width: "100%" }} />

            <TextField.Root placeholder="vollständiger Name des Eigentümers" name="ownerName" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
            <TextField.Root placeholder="Adresse" name="ownerAddress" value={ownerAddress} onChange={(e) => setOwnerAddress(e.target.value)} />
            <TextField.Root placeholder="VIN-Nummer" name="zb2Vin" value={VIN} onChange={(e) => setVIN(e.target.value)} />
            <TextField.Root placeholder="Kfz-Kennzeichen" name="zb1Plate" value={Number} onChange={(e) => setNumber(e.target.value)} />

            {(!hide && upload) && <Button size="6" mt="10" onClick={handleComplite}>Bestätigen</Button>}
        </Flex>
    )
}


export default ZBII
