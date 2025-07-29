const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../../shared/utils/database');
const { authenticateToken, requireRole } = require('../../shared/middleware/auth');

const router = express.Router();

// Obtener todos los doctores
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.id, u.name, u.email, u.created_at,
        d.specialty, d.license_number, d.phone, d.address,
        d.available_hours, d.consultation_fee
      FROM users u
      LEFT JOIN doctors d ON u.id = d.user_id
      WHERE u.role = 'doctor'
      ORDER BY u.name
    `);

    res.json({
      doctors: result.rows
    });
  } catch (error) {
    console.error('Error obteniendo doctores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener doctor específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        u.id, u.name, u.email, u.created_at,
        d.specialty, d.license_number, d.phone, d.address,
        d.available_hours, d.consultation_fee
      FROM users u
      LEFT JOIN doctors d ON u.id = d.user_id
      WHERE u.id = $1 AND u.role = 'doctor'
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor no encontrado' });
    }

    res.json({
      doctor: result.rows[0]
    });
  } catch (error) {
    console.error('Error obteniendo doctor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear perfil de doctor (solo admin o el propio usuario)
router.post('/', [
  authenticateToken,
  requireRole(['admin', 'doctor']),
  body('specialty').trim().notEmpty().withMessage('Especialidad requerida'),
  body('license_number').trim().notEmpty().withMessage('Número de licencia requerido'),
  body('phone').trim().notEmpty().withMessage('Teléfono requerido'),
  body('address').trim().notEmpty().withMessage('Dirección requerida'),
  body('consultation_fee').isNumeric().withMessage('Tarifa de consulta debe ser numérica'),
  body('available_hours').isObject().withMessage('Horarios disponibles requeridos')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { specialty, license_number, phone, address, consultation_fee, available_hours } = req.body;
    const userId = req.user.role === 'admin' ? req.body.user_id : req.user.id;

    // Verificar que el usuario existe y es doctor
    const userResult = await query(
      'SELECT id, role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (userResult.rows[0].role !== 'doctor') {
      return res.status(400).json({ error: 'El usuario debe tener rol de doctor' });
    }

    // Verificar si ya existe perfil de doctor
    const existingDoctor = await query(
      'SELECT id FROM doctors WHERE user_id = $1',
      [userId]
    );

    if (existingDoctor.rows.length > 0) {
      return res.status(400).json({ error: 'El doctor ya tiene un perfil creado' });
    }

    // Crear perfil de doctor
    const result = await query(`
      INSERT INTO doctors (user_id, specialty, license_number, phone, address, consultation_fee, available_hours)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [userId, specialty, license_number, phone, address, consultation_fee, available_hours]);

    res.status(201).json({
      message: 'Perfil de doctor creado exitosamente',
      doctor: result.rows[0]
    });

  } catch (error) {
    console.error('Error creando perfil de doctor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar perfil de doctor
router.put('/:id', [
  authenticateToken,
  requireRole(['admin', 'doctor']),
  body('specialty').optional().trim().notEmpty(),
  body('license_number').optional().trim().notEmpty(),
  body('phone').optional().trim().notEmpty(),
  body('address').optional().trim().notEmpty(),
  body('consultation_fee').optional().isNumeric(),
  body('available_hours').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateFields = req.body;

    // Verificar permisos
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar este perfil' });
    }

    // Construir query de actualización dinámicamente
    const setClause = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] !== undefined) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(updateFields[key]);
        paramCount++;
      }
    });

    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(id);
    const queryText = `
      UPDATE doctors 
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil de doctor no encontrado' });
    }

    res.json({
      message: 'Perfil de doctor actualizado exitosamente',
      doctor: result.rows[0]
    });

  } catch (error) {
    console.error('Error actualizando perfil de doctor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar perfil de doctor (solo admin)
router.delete('/:id', [
  authenticateToken,
  requireRole(['admin'])
], async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que existe el perfil
    const existingDoctor = await query(
      'SELECT id FROM doctors WHERE user_id = $1',
      [id]
    );

    if (existingDoctor.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil de doctor no encontrado' });
    }

    // Eliminar perfil
    await query('DELETE FROM doctors WHERE user_id = $1', [id]);

    res.json({ message: 'Perfil de doctor eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando perfil de doctor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener horarios disponibles de un doctor
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    // Obtener horarios del doctor
    const doctorResult = await query(
      'SELECT available_hours FROM doctors WHERE user_id = $1',
      [id]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor no encontrado' });
    }

    const availableHours = doctorResult.rows[0].available_hours;

    // Si se especifica una fecha, verificar citas existentes
    if (date) {
      const appointmentsResult = await query(`
        SELECT appointment_time 
        FROM appointments 
        WHERE doctor_id = $1 AND DATE(appointment_date) = $2 AND status != 'cancelled'
      `, [id, date]);

      const bookedTimes = appointmentsResult.rows.map(row => row.appointment_time);

      // Filtrar horarios disponibles
      const availableSlots = availableHours.filter(hour => 
        !bookedTimes.includes(hour)
      );

      return res.json({
        doctor_id: id,
        date,
        available_slots: availableSlots,
        booked_times: bookedTimes
      });
    }

    res.json({
      doctor_id: id,
      available_hours: availableHours
    });

  } catch (error) {
    console.error('Error obteniendo disponibilidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 