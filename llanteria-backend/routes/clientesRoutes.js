const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);
router.post('/', clienteController.crearCliente);
router.get('/', clienteController.obtenerCliente);
router.put('/:id', clienteController.actualizarCliente);
router.delete('/:id', clienteController.eliminarCliente);
module.exports = router;
