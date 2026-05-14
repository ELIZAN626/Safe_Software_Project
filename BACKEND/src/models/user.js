const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// // schema tarjeta
// const cardSchema = new mongoose.Schema({
//     cardholderName: { type: String, required: true },
//     last4:          { type: String, required: true },
//     expMonth:       { type: Number, required: true },
//     expYear:        { type: Number, required: true },
//     encryptedCard:  { type: String, required: true }
// });
// 
// // schema usuario
// const userSchema = new mongoose.Schema({
//     username:  { type: String, required: true, unique: true },
//     email:     { type: String, required: true, unique: true },
//     password:  { type: String, required: true },
// 
//     creditCards: [cardSchema],
// 
//     // lista de gallos que posee el usuario (strings)
//     gallos: {
//         type: [String],
//         default: []
//     },
// 
//     // lista de fondos (strings)
//     fondos: {
//         type: [String],
//         default: []
//     },
// 
//     //puntuación global de usuario
//     score: {
//         type: Number,
//         default: 0
//     }
// 
//     ,
//     // fondo seleccionado por el usuario (string)
//     selectedFondo: {
//         type: String,
//         default: 'default'
//     }
// 
// }, { timestamps: true });
// NUEVO
// schema tarjeta
const cardSchema = new mongoose.Schema({
    cardholderName: { type: String, required: true, trim: true, match: /^[a-zA-Z\s]+$/ },
    last4:          { type: String, required: true, match: /^\d{4}$/ },
    expMonth:       { type: Number, required: true, min: 1, max: 12 },
    expYear:        { type: Number, required: true, min: 2000, max: 2100 },
    encryptedCard:  { type: String, required: true }
}, { strict: true });

// schema usuario
const userSchema = new mongoose.Schema({
    username:  { type: String, required: true, unique: true, trim: true, match: /^[a-zA-Z0-9_]+$/ },
    email:     { type: String, required: true, unique: true, trim: true, match: /^\S+@\S+\.\S+$/ },
    password:  { type: String, required: true },

    creditCards: [cardSchema],

    // lista de gallos que posee el usuario (strings)
    gallos: {
        type: [{ type: String, trim: true, match: /^[a-zA-Z0-9\s]+$/ }],
        default: []
    },

    // lista de fondos (strings)
    fondos: {
        type: [{ type: String, trim: true, match: /^[a-zA-Z0-9\s]+$/ }],
        default: []
    },

    //puntuación global de usuario
    score: {
        type: Number,
        default: 0,
        min: 0
    },

    // fondo seleccionado por el usuario (string)
    selectedFondo: {
        type: String,
        default: 'default',
        trim: true,
        match: /^[a-zA-Z0-9\s]+$/
    }

}, { timestamps: true, strict: true });
// NUEVO

// encriptación contraseña
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// validar contraseña
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// // agregar tarjeta
// userSchema.methods.addCreditCard = function(cardNumber, cardholderName, expMonth, expYear) {
//     const cipher = crypto.createCipher('aes-256-ctr', process.env.CARD_SECRET || 'secretkey123');
//     let encrypted = cipher.update(cardNumber, 'utf8', 'hex');
//     encrypted += cipher.final('hex');
// 
//     const last4 = cardNumber.slice(-4);
// 
//     this.creditCards.push({
//         cardholderName,
//         last4,
//         expMonth,
//         expYear,
//         encryptedCard: encrypted
//     });
// };
// NUEVO
// agregar tarjeta
userSchema.methods.addCreditCard = function(cardNumber, cardholderName, expMonth, expYear) {
    // Si process.env.CIPHER_KEY no está definido usamos una de fallback de 32 bytes para dev
    const keyString = process.env.CIPHER_KEY || '12345678901234567890123456789012';
    // Generar una llave de 32 bytes usando scrypt para mayor seguridad
    const key = crypto.scryptSync(keyString, 'salt', 32);
    
    // Generar vector de inicialización (IV) seguro
    const iv = crypto.randomBytes(16);
    
    // Motor aes-256-gcm (garantiza confidencialidad e integridad)
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(cardNumber, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Obtener tag de autenticación (Integridad)
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Concatenamos el iv, authTag y el texto cifrado
    const finalEncrypted = `${iv.toString('hex')}:${authTag}:${encrypted}`;

    const last4 = cardNumber.slice(-4);

    this.creditCards.push({
        cardholderName,
        last4,
        expMonth,
        expYear,
        encryptedCard: finalEncrypted
    });
};
// NUEVO

module.exports = mongoose.model('User', userSchema);
