const express = require('express');
const router = express.Router();
const appointmentRoutes = require('./routes');

// Configuración de rutas de citas
router.use('/appointments', appointmentRoutes);

module.exports = router; 