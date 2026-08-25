const { json } = require('express');
const Producto = require('../models/Producto');

exports.crearProducto = async (req, res) =>{
    try {
        const nuevoProducto = new Producto(req.body);
        await nuevoProducto.save();
        res.status(201).json({mensaje: 'Producto guardado con éxito', producto: nuevoProducto});
    } catch (error) {
        console.error("Error real:", error);
        
        res.status(500).json({mensaje: 'Error al guardar el producto', error})
    }
};

exports.obtenerProducto = async (req, res)=>{
    try {
        const productos = await Producto.find();
        res.status(200).json({mensaje: 'Productos cargados desde la base de datos', productos});
    } catch (error) {
        console.error('Error al obtener los datos de la base de datos', error);
        res.status(500).json({mensaje:'Error al obtener'});
        
    }
};

exports.eliminarProducto = async (req, res) => {
    try {
        const idProducto = await Producto.findByIdAndDelete(req.params.id);
        res.status(200).json({mensaje: 'Producto borrado con exito', idProducto});
    } catch (error) {
        console.error('Error al borrar el producto', error);
        res.status(500).json({mensaje:'Error al borrar'});
    }
}

exports.actualizarProducto = async (req, res) =>{
    try {
        const {id} = req.params;
        const productoActualizado = await Producto.findByIdAndUpdate(id, req.body, { new: true});

        if(!productoActualizado){
            return res.status(404).json({mensaje: "Llanta no encontrada"});
        }

        res.status(200).json({mensaje: 'Llanta actualizada con éxito', producto: productoActualizado });

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al actualizar')
        
    }
}