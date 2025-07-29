const jwt = require('jsonwebtoken');
const { query } = require('../utils/database');

// Middleware para verificar JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Obtener información actualizada del usuario
    const result = await query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware para verificar roles específicos
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticación requerida' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    next();
  };
};

// Middleware para verificar que el usuario es dueño del recurso o admin
const requireOwnershipOrAdmin = (resourceTable, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      
      // Si es admin, permitir acceso
      if (req.user.role === 'admin') {
        return next();
      }

      // Verificar que el usuario es dueño del recurso
      const result = await query(
        `SELECT * FROM ${resourceTable} WHERE ${resourceIdField} = $1 AND user_id = $2`,
        [resourceId, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ 
          error: 'No tienes permisos para acceder a este recurso' 
        });
      }

      next();
    } catch (error) {
      console.error('Error verificando ownership:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnershipOrAdmin
}; 