const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    codigo: { type: String, required: true },
    descripcion: { type: String, required: true },
    marca: { type: String, required: true },
    stock: { type: String, required: true },
    precio: { type: Number, required: true }

}, { timestamps: true });
module.exports = mongoose.model('Producto', productoSchema);