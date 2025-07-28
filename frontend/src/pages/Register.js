import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  GraduationCap,
  Shield,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    phone: '',
    address: '',
    // Campos específicos para doctores
    specialty: '',
    licenseNumber: '',
    consultationFee: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [licenseVerified, setLicenseVerified] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Resetear verificación de licencia si cambia el número
    if (name === 'licenseNumber') {
      setLicenseVerified(false);
    }
  };

  const verifyLicense = async () => {
    if (!formData.licenseNumber) {
      toast.error('Por favor ingresa el número de cédula profesional');
      return;
    }

    // Simulación de verificación de cédula profesional
    // En producción, esto debería conectarse a una API oficial
    try {
      setLoading(true);
      
      // Simular delay de verificación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validación básica (en producción sería más compleja)
      const isValid = formData.licenseNumber.length >= 8 && 
                     /^[A-Z0-9]+$/.test(formData.licenseNumber);
      
      if (isValid) {
        setLicenseVerified(true);
        toast.success('Cédula profesional verificada');
      } else {
        setLicenseVerified(false);
        toast.error('Cédula profesional inválida. Verifica el formato.');
      }
    } catch (error) {
      toast.error('Error al verificar la cédula profesional');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Por favor completa todos los campos obligatorios');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return false;
    }

    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (formData.role === 'doctor') {
      if (!formData.specialty || !formData.licenseNumber || !formData.consultationFee) {
        toast.error('Por favor completa todos los campos requeridos para doctores');
        return false;
      }

      if (!licenseVerified) {
        toast.error('Debes verificar tu cédula profesional antes de registrarte');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        address: formData.address
      };

      // Agregar datos específicos de doctor si es necesario
      if (formData.role === 'doctor') {
        registrationData.specialty = formData.specialty;
        registrationData.licenseNumber = formData.licenseNumber;
        registrationData.consultationFee = parseFloat(formData.consultationFee);
      }

      await register(registrationData);
      toast.success('¡Registro exitoso! Bienvenido a nuestra plataforma médica');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error en registro:', error);
      toast.error(error.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const specialties = [
    'Cardiología',
    'Dermatología',
    'Endocrinología',
    'Gastroenterología',
    'Ginecología',
    'Neurología',
    'Oftalmología',
    'Ortopedia',
    'Pediatría',
    'Psiquiatría',
    'Radiología',
    'Urología',
    'Otra'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Únete a nuestra plataforma médica
          </p>
        </div>

        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Dr. Juan Pérez"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Contraseñas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Tipo de usuario */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Usuario *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="patient">Paciente</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            {/* Información de contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="+34 600 123 456"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Calle Mayor 123, Madrid"
                  />
                </div>
              </div>
            </div>

            {/* Campos específicos para doctores */}
            {formData.role === 'doctor' && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center mb-4">
                  <GraduationCap className="h-5 w-5 text-primary mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Información Profesional</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
                      Especialidad *
                    </label>
                    <select
                      id="specialty"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="">Selecciona una especialidad</option>
                      {specialties.map(specialty => (
                        <option key={specialty} value={specialty}>
                          {specialty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700 mb-2">
                      Tarifa de Consulta (€) *
                    </label>
                    <input
                      id="consultationFee"
                      name="consultationFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.consultationFee}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="80.00"
                      required
                    />
                  </div>
                </div>

                {/* Verificación de cédula profesional */}
                <div className="mt-6">
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Cédula Profesional *
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="licenseNumber"
                        name="licenseNumber"
                        type="text"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        className={`input-field pl-10 ${
                          licenseVerified ? 'border-green-500' : ''
                        }`}
                        placeholder="CARD001"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={verifyLicense}
                      disabled={loading || !formData.licenseNumber}
                      className="btn-secondary px-4 py-2"
                    >
                      {loading ? 'Verificando...' : 'Verificar'}
                    </button>
                  </div>
                  
                  {licenseVerified && (
                    <div className="mt-2 flex items-center text-green-600">
                      <Shield className="h-4 w-4 mr-1" />
                      <span className="text-sm">Cédula profesional verificada</span>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500">
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-700">Verificación de Cédula Profesional</p>
                        <p>Para garantizar la calidad del servicio, verificamos la autenticidad de las cédulas profesionales. 
                        En producción, esto se conectará con la base de datos oficial de profesionales médicos.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || (formData.role === 'doctor' && !licenseVerified)}
                className="btn-primary w-full flex justify-center items-center"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando cuenta...
                  </div>
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 