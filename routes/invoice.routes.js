
const { Router } = require('express')
const { check } = require('express-validator')

const file = require('../middleware/file.middleware')
const GPT = require('../utils/gpt.utils')
const Telegram = require('../utils/telegram.utils')
const Invoice = require('../models/Invoice.model')

const config = require('config')


const router = Router()



router.post('/email', 
    [
        check('email', 'invalidValue').notEmpty().isEmail()
    ], 
    async (req, res) => {        
        const { email } = req.body
        const invoice = await Invoice.create({ email })

        res.status(201).json(true)
    }
)


router.post('/create', 
    [
        // check('login', 'invalidValue').notEmpty().isString(),
        // check('password', 'invalidValue').notEmpty().isString(),
        // check('telegram', 'invalidValue').notEmpty().isInt(),
    ], 
    async (req, res) => {        
        const { email, zbI, zbII, back, front } = req.body

        const invoice = await Invoice.findOne({ email, status: 'CREATE' })
        if(!invoice) { return res.status(400).json(false) }
            
        invoice.email = email
        invoice.ownerName = zbII?.ownerName
        invoice.ownerAddress = zbII?.ownerAddress
        invoice.VIN = zbII?.VIN
        invoice.Number = zbII?.Number
        invoice.zbI = zbI?.code
        invoice.back = back?.code
        invoice.front = front?.code
        invoice.status = 'WAIT'

        await invoice.save()
        console.log(invoice)
        

        //Telegram.sendInvoice(invoice)
        res.status(201).json(invoice)
    }
)

router.post('/ZBII', file.single('file'), async (req, res) => {    
    const email = req.body?.email

    const data = await GPT.extractZBII(req.file?.filename)
    const invoice = await Invoice.findOne({ email, status: 'CREATE' })
    if(!invoice) { return res.status(400).json(false) }

    invoice.links.push(`https://${config.get('serverUrl')}/static/${req.file?.filename}`)
    await invoice.save()

    res.status(201).json(data)
})

router.post('/ZBI', file.single('file'), async (req, res) => {
    const email = req.body?.email

    const data = await GPT.extractZBI(req.file?.filename)
    const invoice = await Invoice.findOne({ email, status: 'CREATE' })
    if(!invoice) { return res.status(400).json(false) }

    invoice.links.push(`https://${config.get('serverUrl')}/static/${req.file?.filename}`)
    await invoice.save()
    
    res.status(201).json(data)
})

router.post('/front', file.single('file'), async (req, res) => {
    const email = req.body?.email

    const data = await GPT.extractFront(req.file?.filename)
    const invoice = await Invoice.findOne({ email, status: 'CREATE' })
    if(!invoice) { return res.status(400).json(false) }

    invoice.links.push(`https://${config.get('serverUrl')}/static/${req.file?.filename}`)
    await invoice.save()

    res.status(201).json(data)
})

router.post('/back', file.single('file'), async (req, res) => {
    const email = req.body?.email

    const data = await GPT.extractBack(req.file?.filename)
    const invoice = await Invoice.findOne({ email, status: 'CREATE' })
    if(!invoice) { return res.status(400).json(false) }

    invoice.links.push(`https://${config.get('serverUrl')}/static/${req.file?.filename}`)
    await invoice.save()

    res.status(201).json(data)
})


router.post('/get', async (req, res) => {        
    const { id } = req.body

    const invoice = await Invoice.findOne({ _id: id })
    if(!invoice) { return res.status(400).json(false) }
        
    res.status(201).json(invoice)
})

module.exports = router