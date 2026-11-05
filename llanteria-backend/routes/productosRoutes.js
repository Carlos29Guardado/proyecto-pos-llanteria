const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);
router.post('/', productoController.crearProducto);
router.get('/', productoController.obtenerProducto);
router.put('/:id', productoController.actualizarProducto);
router.delete('/:id', productoController.eliminarProducto);
module.exports = router;
