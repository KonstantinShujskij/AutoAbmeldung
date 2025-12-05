
const { Router } = require('express')
const { check } = require('express-validator')

const file = require('../middleware/file.middleware')
const GPT = require('../utils/gpt.utils')

// const Interceptor = require('client/core/Interceptor')

// const Validate = require('@validate/User.validate')
// const Serialise = require('@serialize/User.serialize')
// const Format = require('@format/User.format')

// const User = require('@controllers/User.controller')
// const Const = require('client/core/Const')


const router = Router()


router.post('/test', 
    [
        // check('login', 'invalidValue').notEmpty().isString(),
        // check('password', 'invalidValue').notEmpty().isString(),
        // check('telegram', 'invalidValue').notEmpty().isInt(),
    ], 
    async (req, res) => {
        const { ...data } = req.body
        console.log(data)                        
    
        res.status(201).json(true)
    }
)

router.post('/ZBII', file.single('file'), async (req, res) => {    
    const data = await GPT.extractZBII(req.file?.filename)
    console.log(data)

    res.status(201).json(data)

    // res.status(200).json({
    //     "fullName": "Ishkov Kostiantyn Mykolajovich",
    //     "firstName": "Kostiantyn",
    //     "lastName": "Ishkov",
    //     "familyName": "Mykolajovich",
    //     "address": "Am Heikenberg 2, 44534 Lünen",
    //     "street": "Am Heikenberg 2",
    //     "postalCode": "44534",
    //     "city": "Lünen",
    //     "number": "LÜN K8371",
    //     "VIN": "VF32CKFWA47597891"
    // })
})

router.post('/ZBI', file.single('file'), async (req, res) => {
    const data = await GPT.extractZBI(req.file?.filename)
    console.log(data)

    res.status(201).json(data)

    // res.status(200).json({
    //     "code": "F2Bsx6P",
    // })
})

router.post('/front', file.single('file'), async (req, res) => {
    const data = await GPT.extractFront(req.file?.filename)
    console.log(data)

    res.status(201).json(data)

    // res.status(200).json({
    //     "code": "3Ed",
    // })
})

router.post('/back', file.single('file'), async (req, res) => {
    const data = await GPT.extractBack(req.file?.filename)
    console.log(data)

    res.status(201).json(data)

    // res.status(200).json({
    //     "code": "Bv5",
    // })
})

module.exports = router