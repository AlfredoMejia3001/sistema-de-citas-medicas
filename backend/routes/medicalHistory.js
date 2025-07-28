const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// ===== HISTORIAL MÉDICO =====

// Obtener historial médico de un paciente (solo doctores y el propio paciente)
router.get('/patient/:patientId', authenticateToken, async (req, res) => {
    try {
        const { patientId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Verificar permisos
        if (userRole !== 'doctor' && userRole !== 'admin' && userId !== parseInt(patientId)) {
            return res.status(403).json({ message: 'No tienes permisos para ver este historial' });
        }

        const result = await query(`
            SELECT 
                pmh.*,
                p.name as patient_name,
                d.name as doctor_name,
                doc.specialty
            FROM patient_medical_history pmh
            JOIN users p ON pmh.patient_id = p.id
            JOIN users d ON pmh.doctor_id = d.id
            LEFT JOIN doctors doc ON pmh.doctor_id = doc.user_id
            WHERE pmh.patient_id = $1
            ORDER BY pmh.visit_date DESC
        `, [patientId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener historial médico:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Crear nueva entrada en historial médico (solo doctores)
router.post('/patient/:patientId', authenticateToken, requireRole(['doctor', 'admin']), [
    body('visit_date').isDate().withMessage('Fecha de visita es requerida'),
    body('symptoms').optional().isString(),
    body('diagnosis').optional().isString(),
    body('treatment').optional().isString(),
    body('medications').optional().isString(),
    body('vital_signs').optional().isObject(),
    body('lab_results').optional().isString(),
    body('recommendations').optional().isString(),
    body('next_visit_date').optional().isDate()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { patientId } = req.params;
        const doctorId = req.user.id;
        const {
            appointment_id,
            visit_date,
            symptoms,
            diagnosis,
            treatment,
            medications,
            vital_signs,
            lab_results,
            recommendations,
            next_visit_date
        } = req.body;

        const result = await query(`
            INSERT INTO patient_medical_history 
            (patient_id, doctor_id, appointment_id, visit_date, symptoms, diagnosis, treatment, medications, vital_signs, lab_results, recommendations, next_visit_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `, [patientId, doctorId, appointment_id, visit_date, symptoms, diagnosis, treatment, medications, vital_signs, lab_results, recommendations, next_visit_date]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear historial médico:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Actualizar entrada en historial médico (solo el doctor que la creó o admin)
router.put('/:historyId', authenticateToken, requireRole(['doctor', 'admin']), [
    body('visit_date').optional().isDate(),
    body('symptoms').optional().isString(),
    body('diagnosis').optional().isString(),
    body('treatment').optional().isString(),
    body('medications').optional().isString(),
    body('vital_signs').optional().isObject(),
    body('lab_results').optional().isString(),
    body('recommendations').optional().isString(),
    body('next_visit_date').optional().isDate()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { historyId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Verificar que el doctor puede editar esta entrada
        if (userRole !== 'admin') {
            const checkResult = await query('SELECT doctor_id FROM patient_medical_history WHERE id = $1', [historyId]);
            if (checkResult.rows.length === 0) {
                return res.status(404).json({ message: 'Entrada de historial no encontrada' });
            }
            if (checkResult.rows[0].doctor_id !== userId) {
                return res.status(403).json({ message: 'No puedes editar esta entrada' });
            }
        }

        const updateFields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                updateFields.push(`${key} = $${paramCount}`);
                values.push(req.body[key]);
                paramCount++;
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No hay campos para actualizar' });
        }

        values.push(historyId);
        const result = await query(`
            UPDATE patient_medical_history 
            SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramCount}
            RETURNING *
        `, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Entrada de historial no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar historial médico:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// ===== SEGUIMIENTOS MÉDICOS =====

// Obtener seguimientos de un paciente
router.get('/follow-ups/patient/:patientId', authenticateToken, async (req, res) => {
    try {
        const { patientId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Verificar permisos
        if (userRole !== 'doctor' && userRole !== 'admin' && userId !== parseInt(patientId)) {
            return res.status(403).json({ message: 'No tienes permisos para ver estos seguimientos' });
        }

        const result = await query(`
            SELECT 
                mf.*,
                p.name as patient_name,
                d.name as doctor_name,
                doc.specialty
            FROM medical_follow_ups mf
            JOIN users p ON mf.patient_id = p.id
            JOIN users d ON mf.doctor_id = d.id
            LEFT JOIN doctors doc ON mf.doctor_id = doc.user_id
            WHERE mf.patient_id = $1
            ORDER BY mf.scheduled_date ASC
        `, [patientId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener seguimientos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener seguimientos pendientes de un doctor
router.get('/follow-ups/doctor', authenticateToken, requireRole(['doctor', 'admin']), async (req, res) => {
    try {
        const doctorId = req.user.id;
        const result = await query(`
            SELECT 
                mf.*,
                p.name as patient_name,
                p.email as patient_email
            FROM medical_follow_ups mf
            JOIN users p ON mf.patient_id = p.id
            WHERE mf.doctor_id = $1 AND mf.status = 'scheduled' AND mf.scheduled_date >= CURRENT_DATE
            ORDER BY mf.scheduled_date ASC
        `, [doctorId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener seguimientos del doctor:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Crear nuevo seguimiento
router.post('/follow-ups', authenticateToken, requireRole(['doctor', 'admin']), [
    body('patient_id').isInt().withMessage('ID de paciente es requerido'),
    body('follow_up_type').isIn(['routine', 'treatment', 'emergency', 'preventive']).withMessage('Tipo de seguimiento inválido'),
    body('scheduled_date').isDate().withMessage('Fecha programada es requerida'),
    body('notes').optional().isString(),
    body('original_appointment_id').optional().isInt()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const doctorId = req.user.id;
        const {
            patient_id,
            follow_up_type,
            scheduled_date,
            notes,
            original_appointment_id
        } = req.body;

        const result = await query(`
            INSERT INTO medical_follow_ups 
            (patient_id, doctor_id, original_appointment_id, follow_up_type, scheduled_date, notes)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [patient_id, doctorId, original_appointment_id, follow_up_type, scheduled_date, notes]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear seguimiento:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Actualizar seguimiento
router.put('/follow-ups/:followUpId', authenticateToken, requireRole(['doctor', 'admin']), [
    body('status').optional().isIn(['scheduled', 'completed', 'cancelled', 'no_show']),
    body('notes').optional().isString(),
    body('treatment_progress').optional().isString(),
    body('medication_adherence').optional().isIn(['excellent', 'good', 'fair', 'poor']),
    body('side_effects').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { followUpId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Verificar que el doctor puede editar este seguimiento
        if (userRole !== 'admin') {
            const checkResult = await query('SELECT doctor_id FROM medical_follow_ups WHERE id = $1', [followUpId]);
            if (checkResult.rows.length === 0) {
                return res.status(404).json({ message: 'Seguimiento no encontrado' });
            }
            if (checkResult.rows[0].doctor_id !== userId) {
                return res.status(403).json({ message: 'No puedes editar este seguimiento' });
            }
        }

        const updateFields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                updateFields.push(`${key} = $${paramCount}`);
                values.push(req.body[key]);
                paramCount++;
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No hay campos para actualizar' });
        }

        values.push(followUpId);
        const result = await query(`
            UPDATE medical_follow_ups 
            SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramCount}
            RETURNING *
        `, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Seguimiento no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar seguimiento:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// ===== CONDICIONES MÉDICAS =====

// Obtener condiciones médicas de un paciente
router.get('/conditions/patient/:patientId', authenticateToken, async (req, res) => {
    try {
        const { patientId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Verificar permisos
        if (userRole !== 'doctor' && userRole !== 'admin' && userId !== parseInt(patientId)) {
            return res.status(403).json({ message: 'No tienes permisos para ver estas condiciones' });
        }

        const result = await query(`
            SELECT * FROM patient_conditions 
            WHERE patient_id = $1 
            ORDER BY diagnosis_date DESC
        `, [patientId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener condiciones médicas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Agregar condición médica
router.post('/conditions', authenticateToken, requireRole(['doctor', 'admin']), [
    body('patient_id').isInt().withMessage('ID de paciente es requerido'),
    body('condition_type').isIn(['allergy', 'chronic_disease', 'surgery', 'medication', 'family_history', 'other']).withMessage('Tipo de condición inválido'),
    body('name').isString().withMessage('Nombre de la condición es requerido'),
    body('description').optional().isString(),
    body('severity').optional().isIn(['mild', 'moderate', 'severe']),
    body('diagnosis_date').optional().isDate(),
    body('is_active').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            patient_id,
            condition_type,
            name,
            description,
            severity,
            diagnosis_date,
            is_active = true
        } = req.body;

        const result = await query(`
            INSERT INTO patient_conditions 
            (patient_id, condition_type, name, description, severity, diagnosis_date, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [patient_id, condition_type, name, description, severity, diagnosis_date, is_active]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al agregar condición médica:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// ===== DOCUMENTOS MÉDICOS =====

// Obtener documentos médicos de un paciente
router.get('/documents/patient/:patientId', authenticateToken, async (req, res) => {
    try {
        const { patientId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Verificar permisos
        if (userRole !== 'doctor' && userRole !== 'admin' && userId !== parseInt(patientId)) {
            return res.status(403).json({ message: 'No tienes permisos para ver estos documentos' });
        }

        const result = await query(`
            SELECT 
                md.*,
                p.name as patient_name,
                d.name as doctor_name
            FROM medical_documents md
            JOIN users p ON md.patient_id = p.id
            JOIN users d ON md.doctor_id = d.id
            WHERE md.patient_id = $1
            ORDER BY md.created_at DESC
        `, [patientId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener documentos médicos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Agregar documento médico
router.post('/documents', authenticateToken, requireRole(['doctor', 'admin']), [
    body('patient_id').isInt().withMessage('ID de paciente es requerido'),
    body('document_type').isIn(['prescription', 'lab_report', 'imaging', 'referral', 'certificate', 'other']).withMessage('Tipo de documento inválido'),
    body('title').isString().withMessage('Título del documento es requerido'),
    body('description').optional().isString(),
    body('file_path').optional().isString(),
    body('file_size').optional().isInt(),
    body('mime_type').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const doctorId = req.user.id;
        const {
            patient_id,
            document_type,
            title,
            description,
            file_path,
            file_size,
            mime_type
        } = req.body;

        const result = await query(`
            INSERT INTO medical_documents 
            (patient_id, doctor_id, document_type, title, description, file_path, file_size, mime_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [patient_id, doctorId, document_type, title, description, file_path, file_size, mime_type]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al agregar documento médico:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router; 