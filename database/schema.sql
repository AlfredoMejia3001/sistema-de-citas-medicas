-- Crear base de datos (ejecutar manualmente)
-- CREATE DATABASE medical_appointments;

-- Conectar a la base de datos
-- \c medical_appointments;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de perfiles de doctores
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialty VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    consultation_fee DECIMAL(10,2) NOT NULL,
    available_hours JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de citas médicas
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, appointment_date, appointment_time)
);

-- Tabla de historial médico de pacientes
CREATE TABLE IF NOT EXISTS patient_medical_history (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    visit_date DATE NOT NULL,
    symptoms TEXT,
    diagnosis TEXT,
    treatment TEXT,
    medications TEXT,
    vital_signs JSONB, -- {blood_pressure, heart_rate, temperature, weight, height}
    lab_results TEXT,
    recommendations TEXT,
    next_visit_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de seguimiento médico
CREATE TABLE IF NOT EXISTS medical_follow_ups (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    follow_up_type VARCHAR(50) NOT NULL CHECK (follow_up_type IN ('routine', 'treatment', 'emergency', 'preventive')),
    scheduled_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    treatment_progress TEXT,
    medication_adherence VARCHAR(20) CHECK (medication_adherence IN ('excellent', 'good', 'fair', 'poor')),
    side_effects TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de documentos médicos
CREATE TABLE IF NOT EXISTS medical_documents (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('prescription', 'lab_report', 'imaging', 'referral', 'certificate', 'other')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de alergias y condiciones médicas
CREATE TABLE IF NOT EXISTS patient_conditions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    condition_type VARCHAR(50) NOT NULL CHECK (condition_type IN ('allergy', 'chronic_disease', 'surgery', 'medication', 'family_history', 'other')),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe')),
    diagnosis_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_medical_history_patient_id ON patient_medical_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_history_doctor_id ON patient_medical_history(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_history_visit_date ON patient_medical_history(visit_date);

CREATE INDEX IF NOT EXISTS idx_follow_ups_patient_id ON medical_follow_ups(patient_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_doctor_id ON medical_follow_ups(doctor_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled_date ON medical_follow_ups(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_documents_patient_id ON medical_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_doctor_id ON medical_documents(doctor_id);

CREATE INDEX IF NOT EXISTS idx_conditions_patient_id ON patient_conditions(patient_id);
CREATE INDEX IF NOT EXISTS idx_conditions_type ON patient_conditions(condition_type);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_history_updated_at BEFORE UPDATE ON patient_medical_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_follow_ups_updated_at BEFORE UPDATE ON medical_follow_ups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON medical_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conditions_updated_at BEFORE UPDATE ON patient_conditions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vista para historial médico completo
CREATE OR REPLACE VIEW patient_complete_history AS
SELECT 
    pmh.id,
    pmh.patient_id,
    p.name as patient_name,
    pmh.doctor_id,
    d.name as doctor_name,
    pmh.appointment_id,
    pmh.visit_date,
    pmh.symptoms,
    pmh.diagnosis,
    pmh.treatment,
    pmh.medications,
    pmh.vital_signs,
    pmh.lab_results,
    pmh.recommendations,
    pmh.next_visit_date,
    pmh.created_at
FROM patient_medical_history pmh
JOIN users p ON pmh.patient_id = p.id
JOIN users d ON pmh.doctor_id = d.id
ORDER BY pmh.visit_date DESC;

-- Vista para seguimientos pendientes
CREATE OR REPLACE VIEW pending_follow_ups AS
SELECT 
    mf.id,
    mf.patient_id,
    p.name as patient_name,
    mf.doctor_id,
    d.name as doctor_name,
    mf.follow_up_type,
    mf.scheduled_date,
    mf.status,
    mf.notes,
    mf.treatment_progress,
    mf.medication_adherence,
    mf.side_effects
FROM medical_follow_ups mf
JOIN users p ON mf.patient_id = p.id
JOIN users d ON mf.doctor_id = d.id
WHERE mf.status = 'scheduled' AND mf.scheduled_date >= CURRENT_DATE
ORDER BY mf.scheduled_date ASC; 