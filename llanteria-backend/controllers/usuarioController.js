const Usuario = require('../models/Usuario');

exports.crearUsuario = async (req, res) => {
    try {
        const nuevoUsuario = new Usuario(req.body);
        await nuevoUsuario.save();
        res.status(201).json({mensaje: 'Usuario creado correctamente'});
    } catch (error) {
        console.error('Error al intentar crear', error);
        res.status(500).json({mensaje: 'Error al crear el usuario'}) 
    }
};

exports.obtenerUsuario = async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.status(200).json({mensaje: 'Usuarios cargados desde la base de datos', usuarios});
    } catch (error) {
        console.error('Error al obtener los datos de la base de datos', error);
        res.status(500).json({mensaje:'Error al obtener'});
    }
};

exports.actualizarUsuario = async (req, res) => {
    try {
        const {id} = req.params;
        const usuarioActualizado = await Usuario.findByIdAndUpdate(id, req.body, {new: true});
        
        if(!usuarioActualizado){
            return res.status(404).json({mensaje: 'Usuario no encontrado'})
        }

        res.status(200).json({mensaje: 'Usuario actualizado con éxito', usuarios: usuarioActualizado});
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al actualizar')
    }
};

exports.eliminarUsuario = async (req, res) => {
    try {
        const idUsuario = await Usuario.findByIdAndDelete(req.params.id);
        res.status(200).json({mensaje: 'Usuario borrado con éxito'});
    } catch (error) {
        console.error('Error al borrar el usuario', error);
        res.status(500).json({mensaje: 'Error al borrar'})
    }
}