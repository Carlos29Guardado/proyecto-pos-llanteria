const mongoose = require('mongoose');
const Venta = require('../models/Venta');
const Producto = require('../models/Producto');

exports.crearVenta = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let totalCalculado = 0;
        const detallesProcesados = [];

        for (let item of req.body.detalles) {
            //Buscamos el producto en la BD para obtener su precio real
            const productoBD = await Producto.findById(item.producto).session(session);
            if (!productoBD) {
                throw new Error(`El producto con ID ${item.producto} no existe`);
            }
            //Descontar el stock de forma atómica usando $gte
            const productoActualizado = await Producto.findOneAndUpdate(
                { _id: item.producto, stock: { $gte: item.cantidad } },
                { $inc: { stock: -Number(item.cantidad) } },
                { session: session, new: true }
            );

            if (!productoActualizado) {
                throw new Error(`Stock insuficiente para el producto con ID: ${item.producto}`)
            }

            //Se calcula el subtotal usando el precio oficial del producto en la BD
            const subtotal = item.cantidad * productoBD.precio;
            totalCalculado += subtotal;

            //Preparamos el detalle con el precio final
            detallesProcesados.push({
                producto: item.producto,
                cantidad: item.cantidad,
                precio_unitario: productoBD.precio
            });
        }

        const nuevaVenta = new Venta({
            cliente: req.body.cliente,
            detalles: detallesProcesados,
            total_venta: totalCalculado
        });

        await nuevaVenta.save({ session: session });

        await session.commitTransaction();
        res.status(201).json({ msg: 'Venta completa con éxito', venta: nuevaVenta });


    } catch (error) {
        await session.abortTransaction();
        console.log("Transacción abortada:", error.message);
        res.status(400).json({ mensaje: 'Error al procesar la venta, no se desconto nada' })
    } finally {
        session.endSession();
    }
};

exports.obtenerVentas = async (req, res) => {
    try {
        const ventas = await Venta.find().populate('cliente', 'nombre apellido dui').populate('detalles.producto', 'descripcion marca codigo');
        res.status(200).json({ msg: 'Ventas obtenidas', ventas })
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener las ventas', error: error.message })
    }
};
exports.anularVenta = async (req, res) => {
    try {
        const venta = await Venta.findById(req.params.id).session(session);
        if (!venta) {
            throw new Error("Venta no encontrada");
        }
        if (!venta.estado === 'Anulada') {
            throw new Error("Esta venta ya fue anulada previamente");
        }

        //Le devolvemos el stock de cada producto sumando la cantidad

        for (let item of venta.detalles) {
            await Producto.findByIdAndUpdate(
                item.producto,
                { $inc: { stock: Number(item.cantidad) } },
                { session: session }
            );
        }

        venta.estado = 'Anulada';
        await venta.save({ session: session })

        await session.commitTransaction();
        res.status(200).json({ msg: 'Venta anulada y stock devuelto exitosamente', venta });
    } catch (error) {
        await session.abortTransaction();
        console.log("Transacción abortada:", error.message);
        res.status(400).json({ mensaje: error.message });
    } finally {
        session.endSession();
    }
}






