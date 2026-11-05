const Cliente = require('../models/Cliente');
const { manejarError, filtrarCampos } = require('../utils/errores');

const CAMPOS_CLIENTE = ['nombre', 'apellido', 'telefono', 'dui'];

exports.crearCliente = async (req, res) => {
    try {
        const nuevoCliente = new Cliente(filtrarCampos(req.body, CAMPOS_CLIENTE));
        await nuevoCliente.save();
        res.status(201).json({ mensaje: 'Cliente guardado con éxito', cliente: nuevoCliente });
    } catch (error) {
        manejarError(res, error, 'Error al guardar el cliente');
    }
};

exports.obtenerCliente = async (req, res) => {
    try {
        const clientes = await Cliente.find();
        res.status(200).json({ mensaje: 'Clientes cargados desde la base de datos', clientes });
    } catch (error) {
        manejarError(res, error, 'Error al obtener los clientes');
    }
};

exports.eliminarCliente = async (req, res) => {
    try {
        const clienteEliminado = await Cliente.findByIdAndDelete(req.params.id);
        if (!clienteEliminado) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }
        res.status(200).json({ mensaje: 'Cliente borrado con éxito', idCliente: clienteEliminado._id });
    } catch (error) {
        manejarError(res, error, 'Error al borrar el cliente');
    }
}

exports.actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const clienteActualizado = await Cliente.findByIdAndUpdate(
            id,
            filtrarCampos(req.body, CAMPOS_CLIENTE),
            { new: true, runValidators: true }
        );

        if (!clienteActualizado) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        res.status(200).json({ mensaje: 'Cliente actualizado con éxito', cliente: clienteActualizado });
    } catch (error) {
        manejarError(res, error, 'Hubo un error al actualizar el cliente');
    }
}
