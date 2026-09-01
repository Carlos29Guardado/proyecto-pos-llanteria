const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    telefono: {
        type: String,
        trim: true,
        default: ""
    },
    dui: {
        type: String,
        required: true,
        unique: true, 
        sparse: true,
        trim: true
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Cliente', ClienteSchema);