const mongoose = require('mongoose');

const VentaSchema = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    detalles: [{
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto',
            required: true
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1
        },
        precio_unitario: {
            type: Number,
            required: true
        }
    }],
    total_venta: {
        type: Number,
        required: true
    },
    // Dentro de tu Schema
    estado: {
        type: String,
        enum: ['Completada', 'Anulada'],
        default: 'Completada'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Venta', VentaSchema);