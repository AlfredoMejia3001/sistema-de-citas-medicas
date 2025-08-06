import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
const AppointmentsContext = createContext();

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentsProvider');
  }
  return context;
};

export const AppointmentsProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState({});
  const { user } = useAuth();

  // Cargar citas del usuario
  const loadAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await api.get('/api/appointments');
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error cargando citas:', error);
      // Solo mostrar error si no es un error de red o servidor
      if (error.response && error.response.status !== 404) {
        toast.error('Error al cargar las citas');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar doctores
  const loadDoctors = async () => {
    try {
      const response = await api.get('/api/doctors');
      setDoctors(response.data.doctors);
    } catch (error) {
      console.error('Error cargando doctores:', error);
      toast.error('Error al cargar los doctores');
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    if (!user) return;
    
    try {
      const response = await api.get('/api/appointments/stats/overview');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // Crear nueva cita
  const createAppointment = async (appointmentData) => {
    try {
      const response = await api.post('/api/appointments', appointmentData);
      
      // Agregar la nueva cita a la lista
      setAppointments(prev => [response.data.appointment, ...prev]);
      
      toast.success('Cita programada exitosamente');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Error al programar la cita';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Actualizar cita
  const updateAppointment = async (id, updateData) => {
    try {
      const response = await api.put(`/api/appointments/${id}`, updateData);
      
      // Actualizar la cita en la lista
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === id ? response.data.appointment : appointment
        )
      );
      
      toast.success('Cita actualizada exitosamente');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Error al actualizar la cita';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Cancelar cita
  const cancelAppointment = async (id) => {
    try {
      await api.delete(`/api/appointments/${id}`);
      
      // Actualizar el estado de la cita en la lista
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === id 
            ? { ...appointment, status: 'cancelled' }
            : appointment
        )
      );
      
      toast.success('Cita cancelada exitosamente');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Error al cancelar la cita';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Obtener disponibilidad de un doctor
  const getDoctorAvailability = async (doctorId, date) => {
    try {
      const response = await api.get(`/api/doctors/${doctorId}/availability`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo disponibilidad:', error);
      toast.error('Error al obtener la disponibilidad del doctor');
      return null;
    }
  };

  // Obtener cita específica
  const getAppointment = async (id) => {
    try {
      const response = await api.get(`/api/appointments/${id}`);
      return response.data.appointment;
    } catch (error) {
      console.error('Error obteniendo cita:', error);
      toast.error('Error al obtener los detalles de la cita');
      return null;
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      loadAppointments();
      loadDoctors();
      loadStats();
    }
  }, [user]);

  const value = {
    appointments,
    doctors,
    stats,
    loading,
    loadAppointments,
    loadDoctors,
    loadStats,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getDoctorAvailability,
    getAppointment
  };

  return (
    <AppointmentsContext.Provider value={value}>
      {children}
    </AppointmentsContext.Provider>
  );
}; 