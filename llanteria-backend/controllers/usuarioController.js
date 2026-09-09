const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


//Funcion para el login
exports.loginUsuario = async (req, res) => {
    try {
        const { correo, password } = req.body;

        const usuario = await Usuario.findOne({correo});
        if(!usuario){
            return res.status(404).json({mensaje:'Usuario no encontrado'});
        }

        const passwordValido = await bcrypt.compare(password, usuario.password);
        if(!passwordValido){
            return res.status(401).json({mensaje: 'Contraseña incorrecta'})
        }

        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol },
            'LLANTERIA_SECRETO_SEGURO',
            { expiresIn: '8h'}
        );

        res.status(200).json({
            mensaje: 'Login exitoso',
            token: token,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Hubo un error en el servidor' });
    }
}

exports.crearUsuario = async (req, res) => {
    try {
        const { nombre, correo, password, rol } = req.body;

        const salt = await bcrypt.genSalt(10);

        const passwordEncriptado = await bcrypt.hash(password, salt);  

        const nuevoUsuario = new Usuario({
            nombre,
            correo,
            password: passwordEncriptado,
            rol
        });
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
        
        // AGREGAR ESTA VALIDACIÓN: Si es null, mandamos error 404
        if (!idUsuario) {
            return res.status(404).json({mensaje: 'No se encontró el usuario en la BD'});
        }

        res.status(200).json({mensaje: 'Usuario borrado con éxito'});
    } catch (error) {
        console.error('Error al borrar el usuario', error);
        res.status(500).json({mensaje: 'Error al borrar'});
    }
}