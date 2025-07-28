-- Script de inicialización con datos de ejemplo
-- Este archivo se ejecuta automáticamente al crear el contenedor

-- Insertar usuario administrador
INSERT INTO users (name, email, password, role) VALUES 
('Administrador', 'admin@medical.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ3qKGi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insertar doctores de ejemplo
INSERT INTO users (name, email, password, role) VALUES 
('Dr. María González', 'maria.gonzalez@medical.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ3qKGi', 'doctor'),
('Dr. Carlos Rodríguez', 'carlos.rodriguez@medical.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ3qKGi', 'doctor'),
('Dr. Ana Martínez', 'ana.martinez@medical.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ3qKGi', 'doctor'),
('Dr. Luis Fernández', 'luis.fernandez@medical.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ3qKGi', 'doctor'),
('Dr. Carmen López', 'carmen.lopez@medical.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ3qKGi', 'doctor')
ON CONFLICT (email) DO NOTHING;

-- Insertar perfiles de doctores
INSERT INTO doctors (user_id, specialty, license_number, phone, address, consultation_fee, available_hours) VALUES 
((SELECT id FROM users WHERE email = 'maria.gonzalez@medical.com'), 'Cardiología', 'CARD001', '+34 600 123 456', 'Calle Mayor 123, Madrid', 80.00, '["09:00", "10:00", "11:00", "12:00", "16:00", "17:00", "18:00"]'),
((SELECT id FROM users WHERE email = 'carlos.rodriguez@medical.com'), 'Dermatología', 'DERM001', '+34 600 234 567', 'Avenida Principal 456, Barcelona', 70.00, '["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00"]'),
((SELECT id FROM users WHERE email = 'ana.martinez@medical.com'), 'Pediatría', 'PEDI001', '+34 600 345 678', 'Plaza Central 789, Valencia', 60.00, '["08:00", "09:00", "10:00", "11:00", "15:00", "16:00", "17:00"]'),
((SELECT id FROM users WHERE email = 'luis.fernandez@medical.com'), 'Ortopedia', 'ORTO001', '+34 600 456 789', 'Calle San Martín 321, Sevilla', 75.00, '["08:00", "09:00", "10:00", "11:00", "16:00", "17:00", "18:00"]'),
((SELECT id FROM users WHERE email = 'carmen.lopez@medical.com'), 'Ginecología', 'GINE001', '+34 600 567 890', 'Avenida de la Paz 654, Bilbao', 85.00, '["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00"]')
ON CONFLICT (user_id) DO NOTHING;

-- Insertar pacientes de ejemplo
INSERT INTO users (name, email, password, role) VALUES 
('Juan Pérez', 'juan.perez@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ3qKGi', 'patient'),
('María López', 'maria.lopez@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ3qKGi', 'patient'),
('Pedro García', 'pedro.garcia@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ3qKGi', 'patient'),
('Ana Rodríguez', 'ana.rodriguez@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ3qKGi', 'patient'),
('Carlos Martín', 'carlos.martin@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ3qKGi', 'patient')
ON CONFLICT (email) DO NOTHING;

-- Insertar citas de ejemplo
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, notes) VALUES 
((SELECT id FROM users WHERE email = 'juan.perez@email.com'), (SELECT id FROM users WHERE email = 'maria.gonzalez@medical.com'), CURRENT_DATE + INTERVAL '2 days', '10:00:00', 'scheduled', 'Consulta de rutina'),
((SELECT id FROM users WHERE email = 'maria.lopez@email.com'), (SELECT id FROM users WHERE email = 'carlos.rodriguez@medical.com'), CURRENT_DATE + INTERVAL '3 days', '11:00:00', 'confirmed', 'Revisión de piel'),
((SELECT id FROM users WHERE email = 'pedro.garcia@email.com'), (SELECT id FROM users WHERE email = 'ana.martinez@medical.com'), CURRENT_DATE + INTERVAL '1 day', '09:00:00', 'scheduled', 'Control pediátrico'),
((SELECT id FROM users WHERE email = 'ana.rodriguez@email.com'), (SELECT id FROM users WHERE email = 'luis.fernandez@medical.com'), CURRENT_DATE + INTERVAL '4 days', '16:00:00', 'scheduled', 'Dolor en rodilla'),
((SELECT id FROM users WHERE email = 'carlos.martin@email.com'), (SELECT id FROM users WHERE email = 'carmen.lopez@medical.com'), CURRENT_DATE + INTERVAL '5 days', '15:00:00', 'scheduled', 'Consulta ginecológica')
ON CONFLICT (doctor_id, appointment_date, appointment_time) DO NOTHING;

-- Mostrar información de inicialización
SELECT 'Base de datos inicializada correctamente' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_doctors FROM doctors;
SELECT COUNT(*) as total_appointments FROM appointments; 