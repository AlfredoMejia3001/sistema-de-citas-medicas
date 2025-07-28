import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Página no encontrada
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            La página que buscas no existe.
          </p>
        </div>
        <div>
          <Link
            to="/"
            className="btn-primary"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 