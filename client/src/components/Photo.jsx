import { useState, useRef } from "react"
import { Button, Flex, Card, Text } from "@radix-ui/themes"
import Loader from "./Loader"


export default function PhotoLoader({ id, onSubmit }) {
    const [file, setFile] = useState(null)
    const dropRef = useRef(null)

    const handleFiles = (files) => {
        const arr = Array.from(files)
        const firstFile = arr.length ? arr[0] : null
        setFile(firstFile)
    }

    const onDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        dropRef.current.classList.remove("dragover")
        handleFiles(e.dataTransfer.files)
    }

    const onDragOver = (e) => {
        e.preventDefault()
        dropRef.current.classList.add("dragover")
    }

    const onDragLeave = () => { dropRef.current.classList.remove("dragover") }


    // data is good?
    const [loading, setLoading] = useState(false)

    const submitHandler = async () => {
        setLoading(true)
        await onSubmit(file)
        setLoading(false)
    }


    return (
        <Flex direction="column" gap="2">
            <Card className="drop" ref={dropRef} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={() => document.getElementById(id).click()} >
                <input id={id} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
                {!file && <Text size="3" color="gray">Ziehen Sie ein Foto hierher oder klicken Sie, um es auszuwählen.</Text>}
                {file && (
                    <Card className="preview">
                        <img className="preview-img" src={URL.createObjectURL(file)} alt="preview" />
                        <Text size="1" style={{ marginTop: 6 }}>
                            {file.name.length > 20? file.name.slice(0, 20) + "…" : file.name}
                        </Text>
                    </Card>
                )}
            </Card>
            {file && <Button size="2" disabled={!file} onClick={() => submitHandler()}>
                {loading? <Loader /> : 'Parse'}
            </Button>}
        </Flex>
    )
}
