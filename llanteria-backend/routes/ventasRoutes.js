const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

router.post('/', ventaController.crearVenta);
router.get('/', ventaController.obtenerVentas);
router.delete('/:id',ventaController.anularVenta);
module.exports = router;