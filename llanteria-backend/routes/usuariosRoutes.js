const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, soloAdmin } = require('../middleware/auth');

//Rutas públicas
router.post('/login', usuarioController.loginUsuario);
router.post('/auth/google', usuarioController.loginGoogle);

//La gestión de usuarios es exclusiva del administrador
router.use(verificarToken, soloAdmin);
router.post('/', usuarioController.crearUsuario);
router.get('/', usuarioController.obtenerUsuario);
router.put('/:id', usuarioController.actualizarUsuario);
router.delete('/:id', usuarioController.eliminarUsuario);

module.exports = router;
