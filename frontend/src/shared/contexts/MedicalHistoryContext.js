import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MedicalHistoryContext = createContext();

export const useMedicalHistory = () => {
    const context = useContext(MedicalHistoryContext);
    if (!context) {
        throw new Error('useMedicalHistory debe ser usado dentro de MedicalHistoryProvider');
    }
    return context;
};

export const MedicalHistoryProvider = ({ children }) => {
    const [medicalHistory, setMedicalHistory] = useState([]);
    const [followUps, setFollowUps] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Configurar axios con token
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // ===== HISTORIAL MÉDICO =====

    const loadPatientHistory = async (patientId) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/medical-history/patient/${patientId}`, {
                headers: getAuthHeaders()
            });
            setMedicalHistory(response.data);
        } catch (error) {
            console.error('Error cargando historial médico:', error);
            toast.error('Error al cargar el historial médico');
        } finally {
            setLoading(false);
        }
    };

    const createMedicalHistoryEntry = async (patientId, data) => {
        try {
            setLoading(true);
            const response = await axios.post(`/api/medical-history/patient/${patientId}`, data, {
                headers: getAuthHeaders()
            });
            
            // Actualizar el historial local
            setMedicalHistory(prev => [response.data, ...prev]);
            toast.success('Entrada de historial creada exitosamente');
            return response.data;
        } catch (error) {
            console.error('Error creando entrada de historial:', error);
            toast.error('Error al crear entrada de historial');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateMedicalHistoryEntry = async (historyId, data) => {
        try {
            setLoading(true);
            const response = await axios.put(`/api/medical-history/${historyId}`, data, {
                headers: getAuthHeaders()
            });
            
            // Actualizar el historial local
            setMedicalHistory(prev => 
                prev.map(entry => 
                    entry.id === historyId ? response.data : entry
                )
            );
            toast.success('Entrada de historial actualizada exitosamente');
            return response.data;
        } catch (error) {
            console.error('Error actualizando entrada de historial:', error);
            toast.error('Error al actualizar entrada de historial');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // ===== SEGUIMIENTOS MÉDICOS =====

    const loadPatientFollowUps = async (patientId) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/medical-history/follow-ups/patient/${patientId}`, {
                headers: getAuthHeaders()
            });
            setFollowUps(response.data);
        } catch (error) {
            console.error('Error cargando seguimientos:', error);
            toast.error('Error al cargar los seguimientos');
        } finally {
            setLoading(false);
        }
    };

    const loadDoctorFollowUps = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/medical-history/follow-ups/doctor', {
                headers: getAuthHeaders()
            });
            setFollowUps(response.data);
        } catch (error) {
            console.error('Error cargando seguimientos del doctor:', error);
            toast.error('Error al cargar los seguimientos');
        } finally {
            setLoading(false);
        }
    };

    const createFollowUp = async (data) => {
        try {
            setLoading(true);
            const response = await axios.post('/api/medical-history/follow-ups', data, {
                headers: getAuthHeaders()
            });
            
            // Actualizar seguimientos locales
            setFollowUps(prev => [response.data, ...prev]);
            toast.success('Seguimiento creado exitosamente');
            return response.data;
        } catch (error) {
            console.error('Error creando seguimiento:', error);
            toast.error('Error al crear seguimiento');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateFollowUp = async (followUpId, data) => {
        try {
            setLoading(true);
            const response = await axios.put(`/api/medical-history/follow-ups/${followUpId}`, data, {
                headers: getAuthHeaders()
            });
            
            // Actualizar seguimientos locales
            setFollowUps(prev => 
                prev.map(followUp => 
                    followUp.id === followUpId ? response.data : followUp
                )
            );
            toast.success('Seguimiento actualizado exitosamente');
            return response.data;
        } catch (error) {
            console.error('Error actualizando seguimiento:', error);
            toast.error('Error al actualizar seguimiento');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // ===== CONDICIONES MÉDICAS =====

    const loadPatientConditions = async (patientId) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/medical-history/conditions/patient/${patientId}`, {
                headers: getAuthHeaders()
            });
            setConditions(response.data);
        } catch (error) {
            console.error('Error cargando condiciones médicas:', error);
            toast.error('Error al cargar las condiciones médicas');
        } finally {
            setLoading(false);
        }
    };

    const createCondition = async (data) => {
        try {
            setLoading(true);
            const response = await axios.post('/api/medical-history/conditions', data, {
                headers: getAuthHeaders()
            });
            
            // Actualizar condiciones locales
            setConditions(prev => [response.data, ...prev]);
            toast.success('Condición médica agregada exitosamente');
            return response.data;
        } catch (error) {
            console.error('Error agregando condición médica:', error);
            toast.error('Error al agregar condición médica');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // ===== DOCUMENTOS MÉDICOS =====

    const loadPatientDocuments = async (patientId) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/medical-history/documents/patient/${patientId}`, {
                headers: getAuthHeaders()
            });
            setDocuments(response.data);
        } catch (error) {
            console.error('Error cargando documentos médicos:', error);
            toast.error('Error al cargar los documentos médicos');
        } finally {
            setLoading(false);
        }
    };

    const createDocument = async (data) => {
        try {
            setLoading(true);
            const response = await axios.post('/api/medical-history/documents', data, {
                headers: getAuthHeaders()
            });
            
            // Actualizar documentos locales
            setDocuments(prev => [response.data, ...prev]);
            toast.success('Documento médico agregado exitosamente');
            return response.data;
        } catch (error) {
            console.error('Error agregando documento médico:', error);
            toast.error('Error al agregar documento médico');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // ===== FUNCIONES DE UTILIDAD =====

    const getConditionTypeLabel = (type) => {
        const labels = {
            allergy: 'Alergia',
            chronic_disease: 'Enfermedad Crónica',
            surgery: 'Cirugía',
            medication: 'Medicación',
            family_history: 'Historial Familiar',
            other: 'Otro'
        };
        return labels[type] || type;
    };

    const getSeverityLabel = (severity) => {
        const labels = {
            mild: 'Leve',
            moderate: 'Moderado',
            severe: 'Severo'
        };
        return labels[severity] || severity;
    };

    const getFollowUpTypeLabel = (type) => {
        const labels = {
            routine: 'Rutina',
            treatment: 'Tratamiento',
            emergency: 'Emergencia',
            preventive: 'Preventivo'
        };
        return labels[type] || type;
    };

    const getDocumentTypeLabel = (type) => {
        const labels = {
            prescription: 'Receta',
            lab_report: 'Análisis',
            imaging: 'Imagen',
            referral: 'Derivación',
            certificate: 'Certificado',
            other: 'Otro'
        };
        return labels[type] || type;
    };

    const getMedicationAdherenceLabel = (adherence) => {
        const labels = {
            excellent: 'Excelente',
            good: 'Buena',
            fair: 'Regular',
            poor: 'Mala'
        };
        return labels[adherence] || adherence;
    };

    const value = {
        // Estado
        medicalHistory,
        followUps,
        conditions,
        documents,
        loading,

        // Funciones de historial médico
        loadPatientHistory,
        createMedicalHistoryEntry,
        updateMedicalHistoryEntry,

        // Funciones de seguimientos
        loadPatientFollowUps,
        loadDoctorFollowUps,
        createFollowUp,
        updateFollowUp,

        // Funciones de condiciones
        loadPatientConditions,
        createCondition,

        // Funciones de documentos
        loadPatientDocuments,
        createDocument,

        // Funciones de utilidad
        getConditionTypeLabel,
        getSeverityLabel,
        getFollowUpTypeLabel,
        getDocumentTypeLabel,
        getMedicationAdherenceLabel
    };

    return (
        <MedicalHistoryContext.Provider value={value}>
            {children}
        </MedicalHistoryContext.Provider>
    );
}; 