const https = require('https')
const config = require('config')


function sendMessage(telegram, text, botToken=config.get('botToken')) {
    https.get(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${telegram}&text=${text}&parse_mode=html`)
}

function sendInvoice(invoice) {
    let text = `<b>New IN</b>:%0A`
    text += `Email: ${invoice.email}%0A`
    text += `ownerName: ${invoice.ownerName}%0A`
    text += `ownerAddress: ${invoice.ownerAddress}%0A`
    text += `VIN: ${invoice.VIN}%0A`
    text += `Number: ${invoice.Number}%0A`
    text += `zbI Code: ${invoice.zbI}%0A`
    text += `back Code: ${invoice.back}%0A`
    text += `front Code: ${invoice.front}%0A`
    text += `create: ${(new Date(invoice.createdAt)).toLocaleString("uk-UA", {timeZone: "Europe/Kiev"})} %0A`

    text += `%0ALinks:%0A`
    invoice.links.forEach((link) => { text += `${link}%0A` })

    sendMessage(config.get('logGroupe'), text)
}


module.exports = { 
    sendMessage,
    sendInvoice,
}