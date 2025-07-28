import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMedicalHistory } from '../../contexts/MedicalHistoryContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import { 
    Calendar, 
    FileText, 
    Activity, 
    Pill, 
    AlertTriangle, 
    Clock,
    Plus,
    Edit,
    Eye
} from 'lucide-react';

const PatientHistory = () => {
    const { patientId } = useParams();
    const { user } = useAuth();
    const {
        medicalHistory,
        followUps,
        conditions,
        documents,
        loading,
        loadPatientHistory,
        loadPatientFollowUps,
        loadPatientConditions,
        loadPatientDocuments,
        getConditionTypeLabel,
        getSeverityLabel,
        getFollowUpTypeLabel,
        getDocumentTypeLabel,
        getMedicationAdherenceLabel
    } = useMedicalHistory();

    const [activeTab, setActiveTab] = useState('history');
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        if (patientId) {
            loadPatientHistory(patientId);
            loadPatientFollowUps(patientId);
            loadPatientConditions(patientId);
            loadPatientDocuments(patientId);
        }
    }, [patientId]);

    const tabs = [
        { id: 'history', label: 'Historial Médico', icon: FileText },
        { id: 'followups', label: 'Seguimientos', icon: Clock },
        { id: 'conditions', label: 'Condiciones', icon: AlertTriangle },
        { id: 'documents', label: 'Documentos', icon: Activity }
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatVitalSigns = (vitalSigns) => {
        if (!vitalSigns) return 'No registrado';
        
        const signs = [];
        if (vitalSigns.blood_pressure) signs.push(`PA: ${vitalSigns.blood_pressure}`);
        if (vitalSigns.heart_rate) signs.push(`FC: ${vitalSigns.heart_rate} bpm`);
        if (vitalSigns.temperature) signs.push(`Temp: ${vitalSigns.temperature}°C`);
        if (vitalSigns.weight) signs.push(`Peso: ${vitalSigns.weight}`);
        if (vitalSigns.height) signs.push(`Altura: ${vitalSigns.height}`);
        
        return signs.join(', ') || 'No registrado';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-lg">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Historial Médico del Paciente
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Información médica completa y seguimiento del paciente
                    </p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Historial Médico */}
                    {activeTab === 'history' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Historial de Visitas
                                </h2>
                                {(user?.role === 'doctor' || user?.role === 'admin') && (
                                    <button className="btn-primary flex items-center space-x-2">
                                        <Plus size={16} />
                                        <span>Nueva Entrada</span>
                                    </button>
                                )}
                            </div>

                            {medicalHistory.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        No hay historial médico
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Aún no se han registrado visitas médicas.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {medicalHistory.map((entry) => (
                                        <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">
                                                        {formatDate(entry.visit_date)}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        Dr. {entry.doctor_name} - {entry.specialty}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button className="btn-secondary btn-sm">
                                                        <Eye size={14} />
                                                    </button>
                                                    {(user?.role === 'doctor' || user?.role === 'admin') && (
                                                        <button className="btn-primary btn-sm">
                                                            <Edit size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {entry.symptoms && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-700 mb-1">Síntomas</h4>
                                                        <p className="text-sm text-gray-600">{entry.symptoms}</p>
                                                    </div>
                                                )}
                                                {entry.diagnosis && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-700 mb-1">Diagnóstico</h4>
                                                        <p className="text-sm text-gray-600">{entry.diagnosis}</p>
                                                    </div>
                                                )}
                                                {entry.treatment && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-700 mb-1">Tratamiento</h4>
                                                        <p className="text-sm text-gray-600">{entry.treatment}</p>
                                                    </div>
                                                )}
                                                {entry.medications && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-700 mb-1">Medicamentos</h4>
                                                        <p className="text-sm text-gray-600">{entry.medications}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {entry.vital_signs && (
                                                <div className="mt-3">
                                                    <h4 className="font-medium text-gray-700 mb-1">Signos Vitales</h4>
                                                    <p className="text-sm text-gray-600">
                                                        {formatVitalSigns(entry.vital_signs)}
                                                    </p>
                                                </div>
                                            )}

                                            {entry.recommendations && (
                                                <div className="mt-3">
                                                    <h4 className="font-medium text-gray-700 mb-1">Recomendaciones</h4>
                                                    <p className="text-sm text-gray-600">{entry.recommendations}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Seguimientos */}
                    {activeTab === 'followups' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Seguimientos Médicos
                                </h2>
                                {(user?.role === 'doctor' || user?.role === 'admin') && (
                                    <button className="btn-primary flex items-center space-x-2">
                                        <Plus size={16} />
                                        <span>Nuevo Seguimiento</span>
                                    </button>
                                )}
                            </div>

                            {followUps.length === 0 ? (
                                <div className="text-center py-8">
                                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        No hay seguimientos programados
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        No se han programado seguimientos médicos.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {followUps.map((followUp) => (
                                        <div key={followUp.id} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">
                                                        {formatDate(followUp.scheduled_date)}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {getFollowUpTypeLabel(followUp.follow_up_type)} - 
                                                        Dr. {followUp.doctor_name}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    followUp.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                    followUp.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    followUp.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {followUp.status === 'scheduled' ? 'Programado' :
                                                     followUp.status === 'completed' ? 'Completado' :
                                                     followUp.status === 'cancelled' ? 'Cancelado' : 'No asistió'}
                                                </span>
                                            </div>

                                            {followUp.notes && (
                                                <div className="mb-3">
                                                    <h4 className="font-medium text-gray-700 mb-1">Notas</h4>
                                                    <p className="text-sm text-gray-600">{followUp.notes}</p>
                                                </div>
                                            )}

                                            {followUp.treatment_progress && (
                                                <div className="mb-3">
                                                    <h4 className="font-medium text-gray-700 mb-1">Progreso del Tratamiento</h4>
                                                    <p className="text-sm text-gray-600">{followUp.treatment_progress}</p>
                                                </div>
                                            )}

                                            {followUp.medication_adherence && (
                                                <div className="mb-3">
                                                    <h4 className="font-medium text-gray-700 mb-1">Adherencia a Medicación</h4>
                                                    <p className="text-sm text-gray-600">
                                                        {getMedicationAdherenceLabel(followUp.medication_adherence)}
                                                    </p>
                                                </div>
                                            )}

                                            {followUp.side_effects && (
                                                <div>
                                                    <h4 className="font-medium text-gray-700 mb-1">Efectos Secundarios</h4>
                                                    <p className="text-sm text-gray-600">{followUp.side_effects}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Condiciones Médicas */}
                    {activeTab === 'conditions' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Condiciones Médicas
                                </h2>
                                {(user?.role === 'doctor' || user?.role === 'admin') && (
                                    <button className="btn-primary flex items-center space-x-2">
                                        <Plus size={16} />
                                        <span>Agregar Condición</span>
                                    </button>
                                )}
                            </div>

                            {conditions.length === 0 ? (
                                <div className="text-center py-8">
                                    <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        No hay condiciones registradas
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        No se han registrado condiciones médicas.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {conditions.map((condition) => (
                                        <div key={condition.id} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">
                                                        {condition.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {getConditionTypeLabel(condition.condition_type)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {condition.severity && (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            condition.severity === 'severe' ? 'bg-red-100 text-red-800' :
                                                            condition.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                            {getSeverityLabel(condition.severity)}
                                                        </span>
                                                    )}
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        condition.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {condition.is_active ? 'Activa' : 'Inactiva'}
                                                    </span>
                                                </div>
                                            </div>

                                            {condition.description && (
                                                <div className="mb-3">
                                                    <h4 className="font-medium text-gray-700 mb-1">Descripción</h4>
                                                    <p className="text-sm text-gray-600">{condition.description}</p>
                                                </div>
                                            )}

                                            {condition.diagnosis_date && (
                                                <div>
                                                    <h4 className="font-medium text-gray-700 mb-1">Fecha de Diagnóstico</h4>
                                                    <p className="text-sm text-gray-600">
                                                        {formatDate(condition.diagnosis_date)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Documentos Médicos */}
                    {activeTab === 'documents' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Documentos Médicos
                                </h2>
                                {(user?.role === 'doctor' || user?.role === 'admin') && (
                                    <button className="btn-primary flex items-center space-x-2">
                                        <Plus size={16} />
                                        <span>Subir Documento</span>
                                    </button>
                                )}
                            </div>

                            {documents.length === 0 ? (
                                <div className="text-center py-8">
                                    <Activity className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        No hay documentos
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        No se han subido documentos médicos.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {documents.map((document) => (
                                        <div key={document.id} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">
                                                        {document.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {getDocumentTypeLabel(document.document_type)} - 
                                                        Dr. {document.doctor_name}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {formatDate(document.created_at)}
                                                </span>
                                            </div>

                                            {document.description && (
                                                <div className="mb-3">
                                                    <h4 className="font-medium text-gray-700 mb-1">Descripción</h4>
                                                    <p className="text-sm text-gray-600">{document.description}</p>
                                                </div>
                                            )}

                                            {document.file_path && (
                                                <div className="flex items-center space-x-2">
                                                    <button className="btn-secondary btn-sm">
                                                        <Eye size={14} />
                                                        <span>Ver Documento</span>
                                                    </button>
                                                    {document.file_size && (
                                                        <span className="text-xs text-gray-500">
                                                            {(document.file_size / 1024).toFixed(1)} KB
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientHistory; 