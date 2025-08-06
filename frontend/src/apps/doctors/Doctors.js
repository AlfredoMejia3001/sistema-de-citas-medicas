import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, Phone, Clock, Calendar, User } from 'lucide-react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useAppointments } from '../../shared/contexts/AppointmentsContext';
import api from '../../shared/utils/axiosConfig';

const Doctors = () => {
  const { user } = useAuth();
  const { createAppointment } = useAppointments();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentNotes, setAppointmentNotes] = useState('');

  // Estados para el modal de cita
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filterDoctors = useCallback(() => {
    let filtered = doctors;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por especialidad
    if (selectedSpecialty) {
      filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty);
    }

    setFilteredDoctors(filtered);
  }, [doctors, searchTerm, selectedSpecialty]);

  useEffect(() => {
    filterDoctors();
  }, [filterDoctors]);

  const fetchDoctors = async () => {
    try {
      console.log('🔍 Solicitando doctores...');
      const response = await api.get('/api/doctors');
      console.log('✅ Respuesta recibida:', response.data);
      setDoctors(response.data.doctors);
      setFilteredDoctors(response.data.doctors);
      console.log(`📋 Doctores cargados: ${response.data.doctors.length}`);
    } catch (error) {
      console.error('❌ Error fetching doctors:', error);
      console.error('❌ Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const getSpecialties = () => {
    const specialties = doctors.map(doctor => doctor.specialty);
    return [...new Set(specialties)];
  };

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setShowAppointmentModal(true);
  };

  const handleCreateAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Por favor selecciona fecha y hora');
      return;
    }

    setIsCreatingAppointment(true);
    try {
      const appointmentData = {
        doctor_id: selectedDoctor.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        notes: appointmentNotes
      };

      await createAppointment(appointmentData);
      
      // Limpiar formulario
      setSelectedDate('');
      setSelectedTime('');
      setAppointmentNotes('');
      setShowAppointmentModal(false);
      setSelectedDoctor(null);
      
      alert('Cita agendada exitosamente');
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error al agendar la cita');
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  const getAvailableHours = (hours) => {
    if (!hours || !Array.isArray(hours)) return [];
    return hours.map(hour => formatTime(hour));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando doctores...</p>
          <p className="mt-2 text-sm text-gray-500">Debug: {doctors.length} doctores cargados</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay doctores
  if (doctors.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Doctores Disponibles
          </h1>
          <p className="text-gray-600 mb-4">
            No se encontraron doctores disponibles
          </p>
          <button 
            onClick={fetchDoctors}
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Doctores Disponibles
        </h1>
        <p className="text-gray-600">
          Encuentra y agenda citas con nuestros especialistas
        </p>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar doctores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filtro por especialidad */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="input-field pl-10"
            >
              <option value="">Todas las especialidades</option>
              {getSpecialties().map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>

          {/* Contador de resultados */}
          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-600">
              {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 'es' : ''} encontrado{filteredDoctors.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-400 ml-2">
              (Total: {doctors.length})
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Doctores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map(doctor => (
          <div key={doctor.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Header del doctor */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-600">{doctor.specialty}</p>
                </div>
              </div>

              {/* Información de contacto */}
              <div className="space-y-2 mb-4">
                {doctor.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {doctor.phone}
                  </div>
                )}
                {doctor.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {doctor.address}
                  </div>
                )}
                {doctor.available_hours && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Horario disponible
                  </div>
                )}
              </div>

              {/* Honorarios */}
              <div className="mb-4">
                <span className="text-lg font-bold text-primary">
                  ${doctor.consultation_fee}
                </span>
                <span className="text-sm text-gray-600"> por consulta</span>
              </div>

              {/* Botón de agendar */}
              <button
                onClick={() => handleBookAppointment(doctor)}
                className="w-full btn-primary flex items-center justify-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Cita
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Agendar Cita */}
      {showAppointmentModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Agendar Cita con {selectedDoctor.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="input-field"
                >
                  <option value="">Selecciona una hora</option>
                  {getAvailableHours(selectedDoctor.available_hours).map(hour => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  className="input-field"
                  rows="3"
                  placeholder="Describe el motivo de tu consulta..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateAppointment}
                disabled={isCreatingAppointment}
                className="flex-1 btn-primary flex items-center justify-center"
              >
                {isCreatingAppointment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Agendando...
                  </>
                ) : (
                  'Confirmar Cita'
                )}
              </button>
              <button
                onClick={() => {
                  setShowAppointmentModal(false);
                  setSelectedDoctor(null);
                  setSelectedDate('');
                  setSelectedTime('');
                  setAppointmentNotes('');
                }}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors; 