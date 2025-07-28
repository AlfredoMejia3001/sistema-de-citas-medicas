const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../services/emailService');
const router = express.Router();

// Registro de usuarios
router.post('/register', [
    body('name').isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('role').isIn(['patient', 'doctor']).withMessage('Rol inválido'),
    body('phone').optional().isMobilePhone().withMessage('Teléfono inválido'),
    body('address').optional().isString().withMessage('Dirección inválida'),
    // Campos específicos para doctores
    body('specialty').optional().isString().withMessage('Especialidad inválida'),
    body('licenseNumber').optional().isString().withMessage('Número de licencia inválido'),
    body('consultationFee').optional().isFloat({ min: 0 }).withMessage('Tarifa de consulta inválida')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Datos de entrada inválidos',
                errors: errors.array() 
            });
        }

        const {
            name,
            email,
            password,
            role,
            phone,
            address,
            specialty,
            licenseNumber,
            consultationFee
        } = req.body;

        // Verificar si el email ya existe
        const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Verificar si la licencia ya existe (para doctores)
        if (role === 'doctor' && licenseNumber) {
            const existingLicense = await query('SELECT id FROM doctors WHERE license_number = $1', [licenseNumber]);
            if (existingLicense.rows.length > 0) {
                return res.status(400).json({ message: 'El número de cédula profesional ya está registrado' });
            }
        }

        // Encriptar contraseña
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Crear usuario
        const userResult = await query(`
            INSERT INTO users (name, email, password, role, created_at, updated_at)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, name, email, role, created_at
        `, [name, email, hashedPassword, role]);

        const user = userResult.rows[0];

        // Si es doctor, crear perfil de doctor
        if (role === 'doctor') {
            if (!specialty || !licenseNumber || !consultationFee) {
                return res.status(400).json({ 
                    message: 'Los doctores deben proporcionar especialidad, cédula profesional y tarifa de consulta' 
                });
            }

            await query(`
                INSERT INTO doctors (user_id, specialty, license_number, phone, address, consultation_fee, available_hours, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [
                user.id,
                specialty,
                licenseNumber,
                phone || null,
                address || null,
                consultationFee,
                JSON.stringify([]) // Horarios disponibles vacíos por defecto
            ]);
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Enviar email de bienvenida
        try {
            await sendWelcomeEmail(user.email, user.name, user.role);
        } catch (emailError) {
            console.error('Error enviando email de bienvenida:', emailError);
            // No fallar el registro si el email falla
        }

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Login de usuarios
router.post('/login', [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña requerida')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Datos de entrada inválidos',
                errors: errors.array() 
            });
        }

        const { email, password } = req.body;

        // Buscar usuario
        const userResult = await query(`
            SELECT u.id, u.name, u.email, u.password, u.role, u.created_at
            FROM users u
            WHERE u.email = $1
        `, [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = userResult.rows[0];

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Obtener información adicional si es doctor
        let doctorInfo = null;
        if (user.role === 'doctor') {
            const doctorResult = await query(`
                SELECT specialty, license_number, phone, address, consultation_fee
                FROM doctors
                WHERE user_id = $1
            `, [user.id]);
            
            if (doctorResult.rows.length > 0) {
                doctorInfo = doctorResult.rows[0];
            }
        }

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at,
                doctor_info: doctorInfo
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener perfil del usuario
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const userResult = await query(`
            SELECT u.id, u.name, u.email, u.role, u.created_at, u.updated_at
            FROM users u
            WHERE u.id = $1
        `, [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const user = userResult.rows[0];

        // Obtener información adicional si es doctor
        let doctorInfo = null;
        if (user.role === 'doctor') {
            const doctorResult = await query(`
                SELECT specialty, license_number, phone, address, consultation_fee, available_hours
                FROM doctors
                WHERE user_id = $1
            `, [userId]);
            
            if (doctorResult.rows.length > 0) {
                doctorInfo = doctorResult.rows[0];
            }
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
            doctor_info: doctorInfo
        });

    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Actualizar perfil del usuario
router.put('/profile', authenticateToken, [
    body('name').optional().isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    body('phone').optional().isMobilePhone().withMessage('Teléfono inválido'),
    body('address').optional().isString().withMessage('Dirección inválida'),
    // Campos específicos para doctores
    body('specialty').optional().isString().withMessage('Especialidad inválida'),
    body('consultationFee').optional().isFloat({ min: 0 }).withMessage('Tarifa de consulta inválida')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Datos de entrada inválidos',
                errors: errors.array() 
            });
        }

        const userId = req.user.id;
        const { name, phone, address, specialty, consultationFee } = req.body;

        // Actualizar información básica del usuario
        const updateFields = [];
        const values = [];
        let paramCount = 1;

        if (name) {
            updateFields.push(`name = $${paramCount}`);
            values.push(name);
            paramCount++;
        }

        if (updateFields.length > 0) {
            values.push(userId);
            await query(`
                UPDATE users 
                SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = $${paramCount}
            `, values);
        }

        // Actualizar información de doctor si es necesario
        if (req.user.role === 'doctor') {
            const doctorUpdateFields = [];
            const doctorValues = [];
            let doctorParamCount = 1;

            if (phone) {
                doctorUpdateFields.push(`phone = $${doctorParamCount}`);
                doctorValues.push(phone);
                doctorParamCount++;
            }

            if (address) {
                doctorUpdateFields.push(`address = $${doctorParamCount}`);
                doctorValues.push(address);
                doctorParamCount++;
            }

            if (specialty) {
                doctorUpdateFields.push(`specialty = $${doctorParamCount}`);
                doctorValues.push(specialty);
                doctorParamCount++;
            }

            if (consultationFee) {
                doctorUpdateFields.push(`consultation_fee = $${doctorParamCount}`);
                doctorValues.push(consultationFee);
                doctorParamCount++;
            }

            if (doctorUpdateFields.length > 0) {
                doctorValues.push(userId);
                await query(`
                    UPDATE doctors 
                    SET ${doctorUpdateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = $${doctorParamCount}
                `, doctorValues);
            }
        }

        // Obtener usuario actualizado
        const updatedUserResult = await query(`
            SELECT u.id, u.name, u.email, u.role, u.created_at, u.updated_at
            FROM users u
            WHERE u.id = $1
        `, [userId]);

        const updatedUser = updatedUserResult.rows[0];

        // Obtener información de doctor actualizada
        let doctorInfo = null;
        if (updatedUser.role === 'doctor') {
            const doctorResult = await query(`
                SELECT specialty, license_number, phone, address, consultation_fee, available_hours
                FROM doctors
                WHERE user_id = $1
            `, [userId]);
            
            if (doctorResult.rows.length > 0) {
                doctorInfo = doctorResult.rows[0];
            }
        }

        res.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            created_at: updatedUser.created_at,
            updated_at: updatedUser.updated_at,
            doctor_info: doctorInfo
        });

    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Cambiar contraseña
router.put('/change-password', authenticateToken, [
    body('currentPassword').notEmpty().withMessage('Contraseña actual requerida'),
    body('newPassword').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Datos de entrada inválidos',
                errors: errors.array() 
            });
        }

        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Obtener contraseña actual
        const userResult = await query('SELECT password FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const currentHashedPassword = userResult.rows[0].password;

        // Verificar contraseña actual
        const isValidCurrentPassword = await bcrypt.compare(currentPassword, currentHashedPassword);
        if (!isValidCurrentPassword) {
            return res.status(400).json({ message: 'Contraseña actual incorrecta' });
        }

        // Encriptar nueva contraseña
        const saltRounds = 12;
        const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Actualizar contraseña
        await query('UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', 
            [newHashedPassword, userId]);

        res.json({ message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router; 