import { Button, Flex, TextField, Heading, Separator } from "@radix-ui/themes"
import { useState } from "react"
import PhotoLoader from "./Photo"


function FrontNumber({ onComplite }) {
    const [hide, setHide] = useState(false)
    const [upload, setUpload] = useState(false)

    const [code, setCode] = useState("")

    const parseData = async (file) => { 
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("http://127.0.0.1:5555/api/invoice/front", { method: "POST", body: formData })

        if(!res.ok) { console.log("error") }
        const data = await res.json()
        
        if(data.code) { setCode(data.code) }

        setUpload(true) 
    } 
    
    const handleComplite = () => {
        setHide(true)
        onComplite(true)
    }

    return (
        <Flex direction="column" gap="3" mt="4">           
            <Heading size="4">Vorderes Kennzeichen</Heading>
            {!hide && <>
                <PhotoLoader id="Front" onSubmit={parseData} />
                <Separator orientation="horizontal" mt="2" mb="2" style={{ width: "100%" }} />
            </>}

            {/* <TextField.Root placeholder="Номер авто" name="frontPlate" /> */}
            <TextField.Root placeholder="Code (unter dem Aufkleber)" name="frontCode" value={code} onChange={(e) => setCode(e.target.value)} />
            
            {(!hide && upload) && <Button size="6" mt="10" onClick={handleComplite}>Bestätigen</Button>}
        </Flex>
    )
}


export default FrontNumber
