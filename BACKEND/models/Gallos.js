const mongoose = require('mongoose');

// const galloSchema = new mongoose.Schema({
//     nombre: String,
//     vida: Number,
//     poder: Number,
//     bullet: Number,
//     sprites: {
//         spriteBack: String,
//         spriteFront: String
//     },
//     action:[
//         "recharge"
//     ]
//     
// }, { 
//     collection: "Cock's" // Tu colección específica
// });
// NUEVO SAST
const galloSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true, match: /^[a-zA-Z0-9\s]+$/ },
    vida: { type: Number, required: true, min: 0 },
    poder: { type: Number, required: true, min: 0 },
    bullet: { type: Number, required: true, min: 0 },
    sprites: {
        spriteBack: { type: String, required: true, trim: true },
        spriteFront: { type: String, required: true, trim: true }
    },
    action:[{ type: String, trim: true }]
}, { 
    collection: "Cock's", // Tu colección específica
    strict: true
});
// NUEVO SAST

// Exportamos el MODELO para poder usar "Gallo.find()" en otros archivos
module.exports = mongoose.model('Gallo', galloSchema);