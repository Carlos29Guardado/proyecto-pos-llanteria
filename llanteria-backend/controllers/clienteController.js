const { json } = require('express');
const Cliente = require('../models/Cliente');

exports.crearCliente = async (req, res) =>{
    try {
        const nuevoCliente = new Cliente(req.body);
        await nuevoCliente.save();
        res.status(201).json({mensaje: 'Cliente guardado con éxito', Cliente: nuevoProducto});
    } catch (error) {
        console.error("Error real:", error);
        
        res.status(500).json({mensaje: 'Error al guardar el cliente', error: error.message})
    }
};

exports.obtenerCliente = async (req, res)=>{
    try {
        const clientes = await Cliente.find();
        res.status(200).json({mensaje: 'Clientes cargados desde la base de datos', clientes});
    } catch (error) {
        console.error('Error al obtener los datos de la base de datos', error);
        res.status(500).json({mensaje:'Error al obtener'});
        
    }
};

exports.eliminarCliente = async (req, res) => {
    try {
        const idCliente = await Cliente.findByIdAndDelete(req.params.id);
        res.status(200).json({mensaje: 'Cliente borrado con exito', idProducto});
    } catch (error) {
        console.error('Error al borrar el cliente', error);
        res.status(500).json({mensaje:'Error al borrar'});
    }
}

exports.actualizarCliente = async (req, res) =>{
    try {
        const {id} = req.params;
        const clienteActualizado = await Cliente.findByIdAndUpdate(id, req.body, { new: true});

        if(!clienteActualizado){
            return res.status(404).json({mensaje: "Llanta no encontrada"});
        }

        res.status(200).json({mensaje: 'Cliente actualizado con éxito', cliente: clienteActualizado });

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al actualizar')
        
    }
}