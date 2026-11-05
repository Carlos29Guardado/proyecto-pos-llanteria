const mongoose = require('mongoose');
const Venta = require('../models/Venta');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');

//Error con código HTTP para distinguir errores del usuario de fallos del servidor
class ErrorVenta extends Error {
    constructor(mensaje, status = 400) {
        super(mensaje);
        this.status = status;
    }
}

const responderError = (res, error) => {
    if (error instanceof ErrorVenta) {
        return res.status(error.status).json({ mensaje: error.message });
    }
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({ mensaje: 'Datos inválidos', detalle: error.message });
    }
    console.error('Transacción abortada:', error);
    return res.status(500).json({ mensaje: 'Error al procesar la venta' });
};

exports.crearVenta = async (req, res) => {
    const { cliente, detalles } = req.body;
    if (!Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({ mensaje: 'La venta debe incluir al menos un producto' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const clienteBD = await Cliente.exists({ _id: cliente }).session(session);
        if (!clienteBD) {
            throw new ErrorVenta('El cliente seleccionado no existe', 404);
        }

        let totalCalculado = 0;
        const detallesProcesados = [];

        for (const item of detalles) {
            const cantidad = Number(item.cantidad);
            if (!Number.isInteger(cantidad) || cantidad < 1) {
                throw new ErrorVenta('La cantidad de cada producto debe ser un número entero mayor a 0');
            }

            //Descontar el stock de forma atómica: solo se actualiza si hay stock suficiente
            const productoActualizado = await Producto.findOneAndUpdate(
                { _id: item.producto, stock: { $gte: cantidad } },
                { $inc: { stock: -cantidad } },
                { session, new: true }
            );

            if (!productoActualizado) {
                const existe = await Producto.exists({ _id: item.producto }).session(session);
                throw existe
                    ? new ErrorVenta(`Stock insuficiente para el producto con ID: ${item.producto}`)
                    : new ErrorVenta(`El producto con ID ${item.producto} no existe`, 404);
            }

            //Se calcula el subtotal usando el precio oficial del producto en la BD
            totalCalculado += cantidad * productoActualizado.precio;

            detallesProcesados.push({
                producto: item.producto,
                cantidad,
                precio_unitario: productoActualizado.precio
            });
        }

        const nuevaVenta = new Venta({
            cliente,
            detalles: detallesProcesados,
            total_venta: totalCalculado
        });

        await nuevaVenta.save({ session });

        await session.commitTransaction();
        res.status(201).json({ mensaje: 'Venta completa con éxito', venta: nuevaVenta });
    } catch (error) {
        await session.abortTransaction();
        responderError(res, error);
    } finally {
        session.endSession();
    }
};

exports.obtenerVentas = async (req, res) => {
    try {
        const ventas = await Venta.find()
            .sort({ createdAt: -1 })
            .populate('cliente', 'nombre apellido dui')
            .populate('detalles.producto', 'descripcion marca codigo');
        res.status(200).json({ mensaje: 'Ventas obtenidas', ventas })
    } catch (error) {
        console.error('Error al obtener las ventas', error);
        res.status(500).json({ mensaje: 'Error al obtener las ventas' })
    }
};

exports.anularVenta = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const venta = await Venta.findById(req.params.id).session(session);
        if (!venta) {
            throw new ErrorVenta('Venta no encontrada', 404);
        }
        if (venta.estado === 'Anulada') {
            throw new ErrorVenta('Esta venta ya fue anulada previamente', 409);
        }
        //Le devolvemos el stock de cada producto sumando la cantidad
        for (const item of venta.detalles) {
            await Producto.findByIdAndUpdate(
                item.producto,
                { $inc: { stock: item.cantidad } },
                { session }
            );
        }

        venta.estado = 'Anulada';
        await venta.save({ session });
        await session.commitTransaction();
        res.status(200).json({ mensaje: 'Venta anulada y stock devuelto exitosamente', venta });
    } catch (error) {
        await session.abortTransaction();
        responderError(res, error);
    } finally {
        session.endSession();
    }
}
