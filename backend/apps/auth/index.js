const express = require('express');
const router = express.Router();
const authRoutes = require('./routes');

// Configuración de rutas de autenticación
router.use('/auth', authRoutes);

module.exports = router; 