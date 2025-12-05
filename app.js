// require('module-alias/register')

const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const http = require('http')
const https = require('https')

const config = require('config')


const app = express()

const PORT = config.get('port')
const SLL_PORT = config.get('sslPort')
const MONGO_URL = config.get('mongoUri')

app.use(cors())
app.use(express.json({ extended: true }))


app.use('/api/invoice', require('./routes/invoice.routes'))

// app.get('/kvits/:path', (req, res) => { res.sendFile(path.resolve(__dirname, 'static', 'kvits', `${req.params.path}`)) })

// process.on('uncaughtException', (error) => {
//     console.error('❗️Необработанное исключение!')
//     console.error('Сообщение:', error.message)
//     console.error('Стек вызовов:', error.stack)
// })

// process.on('unhandledRejection', (reason, promise) => {
//     console.error('❗️Необработанное отклонение промиса!')
//     if(reason instanceof Error) {
//         console.error('Сообщение:', reason.message)
//         console.error('Стек вызовов:', reason.stack)
//     } 
//     else {
//         console.error('Причина:', reason)
//     }
// })


async function start() {
    await mongoose.connect(MONGO_URL)
    
    if(process.env.NODE_ENV !== 'production') { 
        return app.listen(PORT, () => console.log(`Dev-App has been started on port ${PORT}`))
    }

    const privateKey = fs.readFileSync('/etc/letsencrypt/live/zulassungsstelle.app/privkey.pem', 'utf8')
    const certificate = fs.readFileSync('/etc/letsencrypt/live/zulassungsstelle.app/cert.pem', 'utf8')
    const ca = fs.readFileSync('/etc/letsencrypt/live/zulassungsstelle.app/chain.pem', 'utf8')

    const credentials = { key: privateKey, cert: certificate, ca: ca }

    // app.use('/', express.static(path.join(__dirname, 'client', 'dist')))
    // app.get('*', (req, res) => { res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html')) })

    app.use(express.static(path.join(__dirname, "client", "dist")))
    app.get(/.*/, (req, res) => {res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"))})

    const httpServer = http.createServer(app)
    const httpsServer = https.createServer(credentials, app)

    httpServer.listen(PORT, () => console.log(`App has been started on port ${PORT}`))
    httpsServer.listen(SLL_PORT, () => console.log(`App has been started with ssl on port ${SLL_PORT}`))
}

function run() {
    try { start() }
    catch(error) { process.exit(1) }
}

run()
