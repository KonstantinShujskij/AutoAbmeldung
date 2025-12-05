import { Button, Flex, TextField, Heading } from "@radix-ui/themes"


function Loader() {
    return (
        <div className="lds-ellipsis" bis_skin_checked="1">
            <div bis_skin_checked="1"></div>
            <div bis_skin_checked="1"></div>
            <div bis_skin_checked="1"></div>
            <div bis_skin_checked="1"></div>
        </div>
    )
}


export default Loader

