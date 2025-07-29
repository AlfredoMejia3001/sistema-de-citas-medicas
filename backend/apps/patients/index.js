const express = require('express');
const router = express.Router();
const patientRoutes = require('./routes');

// Configuración de rutas de pacientes
router.use('/patients', patientRoutes);

module.exports = router; 