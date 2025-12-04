const path = require('path')
const fs = require('fs')


function encodeImageToBase64(fileName) {
    const filePath = path.join(__dirname, `../static/${fileName}`)
    
    const imageBuffer = fs.readFileSync(filePath)
    return imageBuffer.toString("base64")
}


module.exports = {
    encodeImageToBase64
}
