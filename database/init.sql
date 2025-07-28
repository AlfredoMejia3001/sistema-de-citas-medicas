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

-- Insertar condiciones médicas de pacientes
INSERT INTO patient_conditions (patient_id, condition_type, name, description, severity, diagnosis_date, is_active) VALUES 
((SELECT id FROM users WHERE email = 'juan.perez@email.com'), 'allergy', 'Alergia a penicilina', 'Reacción alérgica severa a antibióticos del grupo penicilina', 'severe', '2020-03-15', true),
((SELECT id FROM users WHERE email = 'juan.perez@email.com'), 'chronic_disease', 'Hipertensión arterial', 'Presión arterial elevada, requiere medicación diaria', 'moderate', '2018-06-20', true),
((SELECT id FROM users WHERE email = 'maria.lopez@email.com'), 'allergy', 'Alergia a látex', 'Reacción alérgica moderada a productos de látex', 'moderate', '2019-11-10', true),
((SELECT id FROM users WHERE email = 'pedro.garcia@email.com'), 'chronic_disease', 'Diabetes tipo 2', 'Diabetes mellitus tipo 2, controlada con dieta y medicación', 'moderate', '2021-02-28', true),
((SELECT id FROM users WHERE email = 'ana.rodriguez@email.com'), 'surgery', 'Apendicectomía', 'Cirugía de apendicitis realizada en 2019', 'mild', '2019-08-15', false),
((SELECT id FROM users WHERE email = 'carlos.martin@email.com'), 'family_history', 'Cáncer de mama familiar', 'Historial familiar de cáncer de mama en madre y hermana', 'moderate', '2020-01-10', true)
ON CONFLICT DO NOTHING;

-- Insertar historial médico de ejemplo
INSERT INTO patient_medical_history (patient_id, doctor_id, appointment_id, visit_date, symptoms, diagnosis, treatment, medications, vital_signs, lab_results, recommendations, next_visit_date) VALUES 
((SELECT id FROM users WHERE email = 'juan.perez@email.com'), (SELECT id FROM users WHERE email = 'maria.gonzalez@medical.com'), (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM users WHERE email = 'juan.perez@email.com') LIMIT 1), CURRENT_DATE - INTERVAL '30 days', 'Dolor en el pecho, falta de aire', 'Angina de pecho', 'Reposo y medicación antianginosa', 'Nitroglicerina sublingual, Aspirina 100mg', '{"blood_pressure": "140/90", "heart_rate": "85", "temperature": "36.8", "weight": "75kg", "height": "175cm"}', 'Electrocardiograma normal, análisis de sangre sin alteraciones', 'Control en 3 meses, dieta baja en grasas, ejercicio moderado', CURRENT_DATE + INTERVAL '60 days'),
((SELECT id FROM users WHERE email = 'maria.lopez@email.com'), (SELECT id FROM users WHERE email = 'carlos.rodriguez@medical.com'), (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM users WHERE email = 'maria.lopez@email.com') LIMIT 1), CURRENT_DATE - INTERVAL '15 days', 'Erupción cutánea en brazos y piernas', 'Dermatitis de contacto', 'Cremas tópicas y antihistamínicos', 'Hidrocortisona 1% crema, Loratadina 10mg', '{"blood_pressure": "120/80", "heart_rate": "72", "temperature": "36.5", "weight": "60kg", "height": "165cm"}', 'Biopsia de piel confirmó dermatitis de contacto', 'Evitar contacto con alérgenos, hidratación frecuente', CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM users WHERE email = 'pedro.garcia@email.com'), (SELECT id FROM users WHERE email = 'ana.martinez@medical.com'), (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM users WHERE email = 'pedro.garcia@email.com') LIMIT 1), CURRENT_DATE - INTERVAL '45 days', 'Fiebre alta, dolor de garganta', 'Faringitis bacteriana', 'Antibióticos y analgésicos', 'Amoxicilina 500mg, Paracetamol 500mg', '{"blood_pressure": "110/70", "heart_rate": "95", "temperature": "38.5", "weight": "25kg", "height": "120cm"}', 'Cultivo de garganta positivo para Streptococcus', 'Completar tratamiento antibiótico, reposo', CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM users WHERE email = 'ana.rodriguez@email.com'), (SELECT id FROM users WHERE email = 'luis.fernandez@medical.com'), (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM users WHERE email = 'ana.rodriguez@email.com') LIMIT 1), CURRENT_DATE - INTERVAL '20 days', 'Dolor intenso en rodilla derecha', 'Esguince de ligamento lateral', 'Inmovilización y fisioterapia', 'Ibuprofeno 400mg, vendaje funcional', '{"blood_pressure": "125/85", "heart_rate": "78", "temperature": "36.7", "weight": "65kg", "height": "170cm"}', 'Radiografía sin fractura, resonancia pendiente', 'Fisioterapia 3 veces por semana, evitar deportes', CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM users WHERE email = 'carlos.martin@email.com'), (SELECT id FROM users WHERE email = 'carmen.lopez@medical.com'), (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM users WHERE email = 'carlos.martin@email.com') LIMIT 1), CURRENT_DATE - INTERVAL '60 days', 'Dolor abdominal bajo', 'Quiste ovárico', 'Observación y control', 'Analgésicos según necesidad', '{"blood_pressure": "118/75", "heart_rate": "70", "temperature": "36.6", "weight": "58kg", "height": "162cm"}', 'Ecografía pélvica: quiste de 3cm en ovario derecho', 'Control ecográfico en 3 meses, anticonceptivos orales', CURRENT_DATE + INTERVAL '90 days')
ON CONFLICT DO NOTHING;

-- Insertar seguimientos médicos de ejemplo
INSERT INTO medical_follow_ups (patient_id, doctor_id, original_appointment_id, follow_up_type, scheduled_date, status, notes, treatment_progress, medication_adherence, side_effects) VALUES 
((SELECT id FROM users WHERE email = 'juan.perez@email.com'), (SELECT id FROM users WHERE email = 'maria.gonzalez@medical.com'), (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM users WHERE email = 'juan.perez@email.com') LIMIT 1), 'treatment', CURRENT_DATE + INTERVAL '30 days', 'scheduled', 'Control de presión arterial y ajuste de medicación', 'Mejora en síntomas, presión más estable', 'excellent', 'Leve mareo ocasional'),
((SELECT id FROM users WHERE email = 'maria.lopez@email.com'), (SELECT id FROM users WHERE email = 'carlos.rodriguez@medical.com'), (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM users WHERE email = 'maria.lopez@email.com') LIMIT 1), 'routine', CURRENT_DATE + INTERVAL '15 days', 'scheduled', 'Revisión de evolución de dermatitis', 'Erupción mejorando gradualmente', 'good', 'Sequedad leve en zonas tratadas'),
((SELECT id FROM users WHERE email = 'pedro.garcia@email.com'), (SELECT id FROM users WHERE email = 'ana.martinez@medical.com'), (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM users WHERE email = 'pedro.garcia@email.com') LIMIT 1), 'treatment', CURRENT_DATE + INTERVAL '7 days', 'scheduled', 'Control de faringitis y retirada de antibióticos', 'Síntomas resueltos completamente', 'excellent', 'Ninguno'),
((SELECT id FROM users WHERE email = 'ana.rodriguez@email.com'), (SELECT id FROM users WHERE email = 'luis.fernandez@medical.com'), (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM users WHERE email = 'ana.rodriguez@email.com') LIMIT 1), 'treatment', CURRENT_DATE + INTERVAL '14 days', 'scheduled', 'Evaluación de recuperación de esguince', 'Dolor disminuyendo, movilidad mejorando', 'good', 'Leve molestia al caminar'),
((SELECT id FROM users WHERE email = 'carlos.martin@email.com'), (SELECT id FROM users WHERE email = 'carmen.lopez@medical.com'), (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM users WHERE email = 'carlos.martin@email.com') LIMIT 1), 'preventive', CURRENT_DATE + INTERVAL '90 days', 'scheduled', 'Control ecográfico de quiste ovárico', 'Sin síntomas, quiste estable', 'excellent', 'Ninguno')
ON CONFLICT DO NOTHING;

-- Insertar documentos médicos de ejemplo
INSERT INTO medical_documents (patient_id, doctor_id, document_type, title, description, file_path, file_size, mime_type) VALUES 
((SELECT id FROM users WHERE email = 'juan.perez@email.com'), (SELECT id FROM users WHERE email = 'maria.gonzalez@medical.com'), 'prescription', 'Receta - Nitroglicerina y Aspirina', 'Medicación para angina de pecho', '/documents/prescriptions/juan_perez_2024_01_15.pdf', 245760, 'application/pdf'),
((SELECT id FROM users WHERE email = 'maria.lopez@email.com'), (SELECT id FROM users WHERE email = 'carlos.rodriguez@medical.com'), 'lab_report', 'Análisis de sangre - María López', 'Hemograma completo y bioquímica', '/documents/lab_reports/maria_lopez_2024_01_20.pdf', 512000, 'application/pdf'),
((SELECT id FROM users WHERE email = 'pedro.garcia@email.com'), (SELECT id FROM users WHERE email = 'ana.martinez@medical.com'), 'prescription', 'Receta - Amoxicilina', 'Antibiótico para faringitis', '/documents/prescriptions/pedro_garcia_2024_01_10.pdf', 189440, 'application/pdf'),
((SELECT id FROM users WHERE email = 'ana.rodriguez@email.com'), (SELECT id FROM users WHERE email = 'luis.fernandez@medical.com'), 'imaging', 'Radiografía rodilla derecha', 'Radiografía para evaluación de esguince', '/documents/imaging/ana_rodriguez_rodilla_2024_01_25.jpg', 1024000, 'image/jpeg'),
((SELECT id FROM users WHERE email = 'carlos.martin@email.com'), (SELECT id FROM users WHERE email = 'carmen.lopez@medical.com'), 'lab_report', 'Ecografía pélvica', 'Ecografía para evaluación de quiste ovárico', '/documents/lab_reports/carlos_martin_ecografia_2024_01_30.pdf', 768000, 'application/pdf')
ON CONFLICT DO NOTHING;

-- Mostrar información de inicialización
SELECT 'Base de datos inicializada correctamente' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_doctors FROM doctors;
SELECT COUNT(*) as total_appointments FROM appointments; 