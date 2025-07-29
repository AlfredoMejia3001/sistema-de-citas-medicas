const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../../shared/utils/database');
const { authenticateToken, requireOwnershipOrAdmin } = require('../../shared/middleware/auth');
const { sendAppointmentConfirmation, sendAppointmentReminder, sendCancellationEmail } = require('../../shared/services/emailService');

const router = express.Router();

// Obtener citas del usuario (paciente o doctor)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let appointmentsQuery;
    let queryParams = [];

    if (req.user.role === 'doctor') {
      // Doctores ven sus citas programadas
      appointmentsQuery = `
        SELECT 
          a.id, a.appointment_date, a.appointment_time, a.status, a.notes,
          a.created_at, a.updated_at,
          p.name as patient_name, p.email as patient_email,
          d.specialty, d.consultation_fee
        FROM appointments a
        JOIN users p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.user_id
        WHERE a.doctor_id = $1
        ORDER BY a.appointment_date DESC, a.appointment_time ASC
      `;
      queryParams = [req.user.id];
    } else {
      // Pacientes ven sus propias citas
      appointmentsQuery = `
        SELECT 
          a.id, a.appointment_date, a.appointment_time, a.status, a.notes,
          a.created_at, a.updated_at,
          d.name as doctor_name, d.email as doctor_email,
          doc.specialty, doc.consultation_fee, doc.phone as doctor_phone
        FROM appointments a
        JOIN users d ON a.doctor_id = d.id
        JOIN doctors doc ON d.id = doc.user_id
        WHERE a.patient_id = $1
        ORDER BY a.appointment_date DESC, a.appointment_time ASC
      `;
      queryParams = [req.user.id];
    }

    const result = await query(appointmentsQuery, queryParams);

    res.json({
      appointments: result.rows
    });
  } catch (error) {
    console.error('Error obteniendo citas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener cita específica
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        a.id, a.appointment_date, a.appointment_time, a.status, a.notes,
        a.created_at, a.updated_at,
        p.name as patient_name, p.email as patient_email,
        d.name as doctor_name, d.email as doctor_email,
        doc.specialty, doc.consultation_fee, doc.phone as doctor_phone
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
      JOIN doctors doc ON d.id = doc.user_id
      WHERE a.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const appointment = result.rows[0];

    // Verificar permisos
    if (req.user.role !== 'admin' && 
        req.user.id !== appointment.patient_id && 
        req.user.id !== appointment.doctor_id) {
      return res.status(403).json({ error: 'No tienes permisos para ver esta cita' });
    }

    res.json({
      appointment: appointment
    });
  } catch (error) {
    console.error('Error obteniendo cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva cita
router.post('/', [
  authenticateToken,
  requireOwnershipOrAdmin('appointments'),
  body('doctor_id').isInt().withMessage('ID de doctor requerido'),
  body('appointment_date').isDate().withMessage('Fecha de cita requerida'),
  body('appointment_time').notEmpty().withMessage('Hora de cita requerida'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { doctor_id, appointment_date, appointment_time, notes } = req.body;
    const patient_id = req.user.id;

    // Verificar que el doctor existe
    const doctorResult = await query(`
      SELECT u.id, u.name, u.email, d.specialty, d.available_hours
      FROM users u
      JOIN doctors d ON u.id = d.user_id
      WHERE u.id = $1 AND u.role = 'doctor'
    `, [doctor_id]);

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor no encontrado' });
    }

    const doctor = doctorResult.rows[0];

    // Verificar que el horario está disponible
    const availableHours = doctor.available_hours;
    if (!availableHours.includes(appointment_time)) {
      return res.status(400).json({ 
        error: 'El horario seleccionado no está disponible para este doctor' 
      });
    }

    // Verificar que no hay conflicto de horario
    const conflictResult = await query(`
      SELECT id FROM appointments 
      WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 
      AND status != 'cancelled'
    `, [doctor_id, appointment_date, appointment_time]);

    if (conflictResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'El horario seleccionado ya está ocupado' 
      });
    }

    // Verificar que la fecha no es en el pasado
    const appointmentDateTime = new Date(`${appointment_date} ${appointment_time}`);
    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({ 
        error: 'No se pueden programar citas en el pasado' 
      });
    }

    // Crear la cita
    const result = await query(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, notes, status)
      VALUES ($1, $2, $3, $4, $5, 'scheduled')
      RETURNING *
    `, [patient_id, doctor_id, appointment_date, appointment_time, notes]);

    const appointment = result.rows[0];

    // Enviar email de confirmación
    try {
      await sendAppointmentConfirmation(
        req.user.email,
        req.user.name,
        doctor.name,
        appointment_date,
        appointment_time,
        doctor.specialty
      );
    } catch (emailError) {
      console.error('Error enviando email de confirmación:', emailError);
    }

    res.status(201).json({
      message: 'Cita programada exitosamente',
      appointment: {
        id: appointment.id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        status: appointment.status,
        doctor_name: doctor.name,
        specialty: doctor.specialty
      }
    });

  } catch (error) {
    console.error('Error creando cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar cita
router.put('/:id', [
  authenticateToken,
  body('status').optional().isIn(['scheduled', 'confirmed', 'cancelled', 'completed']),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    // Obtener la cita actual
    const currentAppointment = await query(`
      SELECT a.*, p.name as patient_name, p.email as patient_email,
             d.name as doctor_name, d.email as doctor_email
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
      WHERE a.id = $1
    `, [id]);

    if (currentAppointment.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const appointment = currentAppointment.rows[0];

    // Verificar permisos
    if (req.user.role !== 'admin' && 
        req.user.id !== appointment.patient_id && 
        req.user.id !== appointment.doctor_id) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar esta cita' });
    }

    // Construir query de actualización
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (status !== undefined) {
      updateFields.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCount}`);
      values.push(notes);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(id);
    const queryText = `
      UPDATE appointments 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(queryText, values);
    const updatedAppointment = result.rows[0];

    // Enviar email de cancelación si se cancela
    if (status === 'cancelled' && appointment.status !== 'cancelled') {
      try {
        await sendCancellationEmail(
          appointment.patient_email,
          appointment.patient_name,
          appointment.doctor_name,
          appointment.appointment_date,
          appointment.appointment_time
        );
      } catch (emailError) {
        console.error('Error enviando email de cancelación:', emailError);
      }
    }

    res.json({
      message: 'Cita actualizada exitosamente',
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error('Error actualizando cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Cancelar cita
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener la cita
    const appointmentResult = await query(`
      SELECT a.*, p.name as patient_name, p.email as patient_email,
             d.name as doctor_name, d.email as doctor_email
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
      WHERE a.id = $1
    `, [id]);

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const appointment = appointmentResult.rows[0];

    // Verificar permisos
    if (req.user.role !== 'admin' && 
        req.user.id !== appointment.patient_id && 
        req.user.id !== appointment.doctor_id) {
      return res.status(403).json({ error: 'No tienes permisos para cancelar esta cita' });
    }

    // Verificar que no esté ya cancelada
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'La cita ya está cancelada' });
    }

    // Cancelar la cita
    await query(
      'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2',
      ['cancelled', id]
    );

    // Enviar email de cancelación
    try {
      await sendCancellationEmail(
        appointment.patient_email,
        appointment.patient_name,
        appointment.doctor_name,
        appointment.appointment_date,
        appointment.appointment_time
      );
    } catch (emailError) {
      console.error('Error enviando email de cancelación:', emailError);
    }

    res.json({ message: 'Cita cancelada exitosamente' });

  } catch (error) {
    console.error('Error cancelando cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas de citas (solo admin y doctores)
router.get('/stats/overview', [
  authenticateToken,
  requireOwnershipOrAdmin('appointments')
], async (req, res) => {
  try {
    let statsQuery;
    let queryParams = [];

    if (req.user.role === 'doctor') {
      statsQuery = `
        SELECT 
          COUNT(*) as total_appointments,
          COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
        FROM appointments 
        WHERE doctor_id = $1
      `;
      queryParams = [req.user.id];
    } else {
      // Admin ve todas las citas
      statsQuery = `
        SELECT 
          COUNT(*) as total_appointments,
          COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
        FROM appointments
      `;
    }

    const result = await query(statsQuery, queryParams);

    res.json({
      stats: result.rows[0]
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 