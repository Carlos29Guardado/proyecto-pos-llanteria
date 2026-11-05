const crypto = require('crypto');
const Usuario = require('../models/Usuario');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { manejarError, filtrarCampos } = require('../utils/errores');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//Genera el JWT y la respuesta común de ambos logins
const responderSesion = (res, usuario, mensaje) => {
    const token = jwt.sign(
        { id: usuario._id, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    res.status(200).json({
        mensaje,
        token,
        usuario: {
            id: usuario._id,
            nombre: usuario.nombre,
            rol: usuario.rol
        }
    });
};

//Funcion para el login
exports.loginUsuario = async (req, res) => {
    try {
        const { correo, password } = req.body;
        if (typeof correo !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
        }

        const usuario = await Usuario.findOne({ correo });
        //Mismo mensaje para usuario inexistente y contraseña incorrecta, así no se revela qué correos existen
        const passwordValido = usuario && await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        responderSesion(res, usuario, 'Login exitoso');
    } catch (error) {
        manejarError(res, error, 'Hubo un error en el servidor');
    }
}

//Funcion para login con google
exports.loginGoogle = async (req, res) => {
    let payload;
    try {
        const ticket = await client.verifyIdToken({
            idToken: req.body.token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
    } catch (error) {
        return res.status(401).json({ mensaje: 'Token de Google inválido o expirado' });
    }

    try {
        const correo = payload.email;

        //Buscamos el usuario en DB
        let usuario = await Usuario.findOne({ correo });
        //Si no existe, se registra
        if (!usuario) {
            //Contraseña aleatoria imposible de adivinar: esta cuenta solo entra con Google
            const passwordAleatorio = crypto.randomBytes(32).toString('hex');

            usuario = new Usuario({
                nombre: payload.name,
                correo,
                password: await bcrypt.hash(passwordAleatorio, 10),
                rol: 'CAJERO'
            });

            await usuario.save();
        }

        responderSesion(res, usuario, 'Login con Google exitoso');
    } catch (error) {
        manejarError(res, error, 'Error en login de Google');
    }
}

exports.crearUsuario = async (req, res) => {
    try {
        const { nombre, correo, password, rol } = req.body;
        if (typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const nuevoUsuario = new Usuario({
            nombre,
            correo,
            password: await bcrypt.hash(password, 10),
            rol
        });
        await nuevoUsuario.save();
        res.status(201).json({ mensaje: 'Usuario creado correctamente' });
    } catch (error) {
        manejarError(res, error, 'Error al crear el usuario');
    }
};

exports.obtenerUsuario = async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-password');
        res.status(200).json({ mensaje: 'Usuarios cargados desde la base de datos', usuarios });
    } catch (error) {
        manejarError(res, error, 'Error al obtener los usuarios');
    }
};

exports.actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const cambios = filtrarCampos(req.body, ['nombre', 'correo', 'rol']);

        //La contraseña solo se cambia si se envía una nueva, y siempre se guarda encriptada
        if (req.body.password) {
            if (typeof req.body.password !== 'string' || req.body.password.length < 6) {
                return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
            }
            cambios.password = await bcrypt.hash(req.body.password, 10);
        }

        const usuarioActualizado = await Usuario.findByIdAndUpdate(id, cambios, { new: true, runValidators: true }).select('-password');

        if (!usuarioActualizado) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' })
        }

        res.status(200).json({ mensaje: 'Usuario actualizado con éxito', usuarios: usuarioActualizado });
    } catch (error) {
        manejarError(res, error, 'Hubo un error al actualizar');
    }
};

exports.eliminarUsuario = async (req, res) => {
    try {
        if (req.params.id === req.usuario.id) {
            return res.status(400).json({ mensaje: 'No puedes eliminar tu propio usuario' });
        }

        const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuarioEliminado) {
            return res.status(404).json({ mensaje: 'No se encontró el usuario en la BD' });
        }

        res.status(200).json({ mensaje: 'Usuario borrado con éxito' });
    } catch (error) {
        manejarError(res, error, 'Error al borrar el usuario');
    }
}
