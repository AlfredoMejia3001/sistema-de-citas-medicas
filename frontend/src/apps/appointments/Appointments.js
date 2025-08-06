import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useAppointments } from '../../shared/contexts/AppointmentsContext';
import { 
  Calendar, 
  Clock, 
  User, 
  Filter, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Eye,
  AlertCircle
} from 'lucide-react';

const Appointments = () => {
  const { user } = useAuth();
  const { 
    appointments, 
    loadAppointments, 
    updateAppointment, 
    deleteAppointment,
    createAppointment 
  } = useAppointments();
  
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados para formularios
  const [editForm, setEditForm] = useState({
    appointment_date: '',
    appointment_time: '',
    status: '',
    notes: ''
  });

  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (user) {
      loadAppointments();
      fetchDoctors();
    }
  }, [user, loadAppointments]);

  const filterAppointments = useCallback(() => {
    let filtered = appointments || [];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(apt => {
        const searchLower = searchTerm.toLowerCase();
        const patientName = apt.patient_name?.toLowerCase() || '';
        const doctorName = apt.doctor_name?.toLowerCase() || '';
        const notes = apt.notes?.toLowerCase() || '';
        
        return patientName.includes(searchLower) || 
               doctorName.includes(searchLower) || 
               notes.includes(searchLower);
      });
    }

    // Filtrar por estado
    if (statusFilter) {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Filtrar por fecha
    if (dateFilter) {
      filtered = filtered.filter(apt => apt.appointment_date === dateFilter);
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  useEffect(() => {
    filterAppointments();
  }, [filterAppointments]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors);
      } else {
        console.error('Error fetching doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setEditForm({
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      status: appointment.status,
      notes: appointment.notes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return;

    setLoading(true);
    try {
      await updateAppointment(selectedAppointment.id, editForm);
      setShowEditModal(false);
      setSelectedAppointment(null);
      alert('Cita actualizada exitosamente');
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Error al actualizar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) return;

    setLoading(true);
    try {
      await deleteAppointment(appointmentId);
      alert('Cita cancelada exitosamente');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Error al cancelar la cita');
    } finally {
      setLoading(false);
    }
  };



  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'No disponible';
    return timeString.substring(0, 5);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'no_show': return 'No asistió';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'no_show': return <AlertCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mis Citas
            </h1>
            <p className="text-gray-600">
              Gestiona y revisa todas tus citas médicas
            </p>
          </div>

        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar citas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filtro por estado */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-10"
            >
              <option value="">Todos los estados</option>
              <option value="scheduled">Programada</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
              <option value="no_show">No asistió</option>
            </select>
          </div>

          {/* Filtro por fecha */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Contador */}
          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-600">
              {filteredAppointments.length} cita{filteredAppointments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de Citas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente/Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user?.role === 'doctor' ? appointment.patient_name : appointment.doctor_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user?.role === 'doctor' ? 'Paciente' : appointment.specialty}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(appointment.appointment_date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(appointment.appointment_time)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1">{getStatusText(appointment.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {appointment.notes || 'Sin notas'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(appointment)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="text-green-600 hover:text-green-900"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Cancelar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Detalles de la Cita</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Paciente:</span> {selectedAppointment.patient_name}
              </div>
              <div>
                <span className="font-medium">Doctor:</span> {selectedAppointment.doctor_name}
              </div>
              <div>
                <span className="font-medium">Especialidad:</span> {selectedAppointment.specialty}
              </div>
              <div>
                <span className="font-medium">Fecha:</span> {formatDate(selectedAppointment.appointment_date)}
              </div>
              <div>
                <span className="font-medium">Hora:</span> {formatTime(selectedAppointment.appointment_time)}
              </div>
              <div>
                <span className="font-medium">Estado:</span> {getStatusText(selectedAppointment.status)}
              </div>
              <div>
                <span className="font-medium">Notas:</span> {selectedAppointment.notes || 'Sin notas'}
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full btn-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Editar Cita</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={editForm.appointment_date}
                  onChange={(e) => setEditForm({...editForm, appointment_date: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora
                </label>
                <input
                  type="time"
                  value={editForm.appointment_time}
                  onChange={(e) => setEditForm({...editForm, appointment_time: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="input-field"
                >
                  <option value="scheduled">Programada</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="no_show">No asistió</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  className="input-field"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUpdateAppointment}
                disabled={loading}
                className="flex-1 btn-primary"
              >
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
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

export default Appointments; 