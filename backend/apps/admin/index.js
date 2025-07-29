const express = require('express');
const router = express.Router();

// Rutas de administración
router.get('/stats', (req, res) => {
  res.json({ message: 'Estadísticas del sistema' });
});

router.get('/users', (req, res) => {
  res.json({ message: 'Lista de usuarios' });
});

module.exports = router; 