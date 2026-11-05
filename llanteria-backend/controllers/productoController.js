const Producto = require('../models/Producto');
const { manejarError, filtrarCampos } = require('../utils/errores');

const CAMPOS_PRODUCTO = ['codigo', 'descripcion', 'marca', 'stock', 'precio'];

exports.crearProducto = async (req, res) => {
    try {
        const nuevoProducto = new Producto(filtrarCampos(req.body, CAMPOS_PRODUCTO));
        await nuevoProducto.save();
        res.status(201).json({ mensaje: 'Producto guardado con éxito', producto: nuevoProducto });
    } catch (error) {
        manejarError(res, error, 'Error al guardar el producto');
    }
};

exports.obtenerProducto = async (req, res) => {
    try {
        const productos = await Producto.find();
        res.status(200).json({ mensaje: 'Productos cargados desde la base de datos', productos });
    } catch (error) {
        manejarError(res, error, 'Error al obtener los productos');
    }
};

exports.eliminarProducto = async (req, res) => {
    try {
        const productoEliminado = await Producto.findByIdAndDelete(req.params.id);
        if (!productoEliminado) {
            return res.status(404).json({ mensaje: 'Llanta no encontrada' });
        }
        res.status(200).json({ mensaje: 'Producto borrado con éxito', idProducto: productoEliminado._id });
    } catch (error) {
        manejarError(res, error, 'Error al borrar el producto');
    }
}

exports.actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const productoActualizado = await Producto.findByIdAndUpdate(
            id,
            filtrarCampos(req.body, CAMPOS_PRODUCTO),
            { new: true, runValidators: true }
        );

        if (!productoActualizado) {
            return res.status(404).json({ mensaje: 'Llanta no encontrada' });
        }

        res.status(200).json({ mensaje: 'Llanta actualizada con éxito', producto: productoActualizado });
    } catch (error) {
        manejarError(res, error, 'Hubo un error al actualizar el producto');
    }
}
