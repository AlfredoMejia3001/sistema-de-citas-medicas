import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Información de la empresa */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CM</span>
              </div>
              <span className="text-xl font-bold">Citas Médicas</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Sistema moderno y confiable para la gestión de citas médicas. 
              Conectamos pacientes con profesionales de la salud de manera 
              eficiente y segura.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Hecho con</span>
              <Heart size={16} className="text-red-500 fill-current" />
              <span>en Morelia, Michoacán, México</span>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  to="/doctors" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Doctores
                </Link>
              </li>
              <li>
                <Link 
                  to="/appointments" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Citas
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Iniciar Sesión
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-300">info@citasmedicas.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-300">+34 900 123 456</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-300">Morelia, Michoacán, México</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Sistema de Citas Médicas. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacidad
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Términos
              </Link>
              <Link 
                to="/help" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Ayuda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 