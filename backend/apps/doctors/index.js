const express = require('express');
const router = express.Router();
const doctorRoutes = require('./routes');

// Configuración de rutas de doctores
router.use('/doctors', doctorRoutes);

module.exports = router; 