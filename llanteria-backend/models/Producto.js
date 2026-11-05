const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    codigo: { type: String, required: true, unique: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    marca: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0 },
    precio: { type: Number, required: true, min: 0 }

}, { timestamps: true });
module.exports = mongoose.model('Producto', productoSchema);
