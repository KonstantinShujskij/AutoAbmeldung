const {Schema, model, Types} = require('mongoose')

const schema = new Schema({
    email: {type: String, default: ''}, 
    ownerName: {type: String, default: ''}, 
    ownerAddress: {type: String, default: ''},
    VIN: {type: String, default: ''},
    Number: {type: String, default: ''},
    zbI: {type: String, default: ''},
    back: {type: String, default: ''}, 
    front: {type: String, default: ''},
    status: {type: String, default: 'CREATE'},

    links: [{type: String}],

    createdAt: { type: Number },
    updatedAt: { type: Number }
}, {
    timestamps: { currentTime: () => Date.now() }
})

module.exports = model('Invoice', schema)
