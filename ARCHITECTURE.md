# Arquitectura Modular del Sistema de Citas Médicas

## 🏗️ Visión General

El proyecto ha sido reorganizado siguiendo una arquitectura modular tipo Django, donde cada funcionalidad está encapsulada en su propia "app" tanto en el frontend como en el backend.

## 📁 Estructura de Directorios

### Frontend (`frontend/src/`)

```
src/
├── apps/                    # Aplicaciones modulares
│   ├── auth/               # Autenticación
│   │   ├── Login.js        # Página de login
│   │   ├── Register.js     # Página de registro
│   │   └── index.js        # Exportaciones de la app
│   ├── patients/           # Gestión de pacientes
│   │   ├── Profile.js      # Perfil de usuario
│   │   ├── PatientHistory.js # Historial médico
│   │   └── index.js        # Exportaciones de la app
│   ├── doctors/            # Gestión de doctores
│   │   ├── Doctors.js      # Listado de doctores
│   │   └── index.js        # Exportaciones de la app
│   ├── appointments/       # Gestión de citas
│   │   ├── Appointments.js # Gestión de citas
│   │   ├── Dashboard.js    # Panel principal
│   │   └── index.js        # Exportaciones de la app
│   ├── admin/              # Panel de administración
│   │   └── index.js        # Componentes de admin
│   └── index.js            # Exportaciones principales
├── shared/                 # Componentes compartidos
│   ├── components/         # Componentes UI reutilizables
│   ├── contexts/           # Contextos de React
│   └── utils/              # Utilidades y helpers
└── App.js                  # Componente principal
```

### Backend (`backend/`)

```
backend/
├── apps/                   # Aplicaciones modulares
│   ├── auth/              # Autenticación
│   │   ├── routes.js      # Rutas de autenticación
│   │   └── index.js       # Configuración de la app
│   ├── patients/          # Gestión de pacientes
│   │   ├── routes.js      # Rutas de pacientes
│   │   └── index.js       # Configuración de la app
│   ├── doctors/           # Gestión de doctores
│   │   ├── routes.js      # Rutas de doctores
│   │   └── index.js       # Configuración de la app
│   ├── appointments/      # Gestión de citas
│   │   ├── routes.js      # Rutas de citas
│   │   └── index.js       # Configuración de la app
│   └── admin/             # Panel de administración
│       └── index.js       # Rutas de administración
├── shared/                # Utilidades compartidas
│   ├── middleware/        # Middlewares
│   ├── services/          # Servicios (email, etc.)
│   └── utils/             # Utilidades y helpers
└── server.js              # Servidor principal
```

## 🔧 Configuración de Apps

### Frontend Apps

Cada app del frontend tiene su propio archivo `index.js` que exporta los componentes:

```javascript
// apps/auth/index.js
export { default as Login } from './Login';
export { default as Register } from './Register';

// apps/patients/index.js
export { default as Profile } from './Profile';
export { default as PatientHistory } from './PatientHistory';
```

### Backend Apps

Cada app del backend tiene su propio archivo `index.js` que configura las rutas:

```javascript
// apps/auth/index.js
const express = require('express');
const router = express.Router();
const authRoutes = require('./routes');

router.use('/auth', authRoutes);
module.exports = router;
```

## 🚀 Configuración del Servidor

El servidor principal (`server.js`) importa y configura todas las apps:

```javascript
// Importar apps
const authApp = require('./apps/auth');
const patientsApp = require('./apps/patients');
const doctorsApp = require('./apps/doctors');
const appointmentsApp = require('./apps/appointments');
const adminApp = require('./apps/admin');

// Configurar rutas
app.use('/api', authApp);
app.use('/api', patientsApp);
app.use('/api', doctorsApp);
app.use('/api', appointmentsApp);
app.use('/api/admin', adminApp);
```

## 📱 Configuración del Frontend

El componente principal (`App.js`) importa desde las apps modulares:

```javascript
import Login from './apps/auth/Login';
import Register from './apps/auth/Register';
import Dashboard from './apps/appointments/Dashboard';
import Doctors from './apps/doctors/Doctors';
import Appointments from './apps/appointments/Appointments';
import Profile from './apps/patients/Profile';
```

## 🎯 Beneficios de la Arquitectura Modular

### 1. **Separación de Responsabilidades**
- Cada app maneja su propia funcionalidad
- Código más organizado y mantenible
- Fácil identificación de dónde hacer cambios

### 2. **Escalabilidad**
- Fácil agregar nuevas funcionalidades
- Apps independientes que pueden crecer por separado
- Reutilización de componentes

### 3. **Mantenimiento**
- Cambios aislados por funcionalidad
- Testing más específico
- Debugging más fácil

### 4. **Colaboración en Equipo**
- Diferentes desarrolladores pueden trabajar en diferentes apps
- Menos conflictos de merge
- Código más legible

## 🔄 Flujo de Datos

### Frontend
1. **Contextos** (`shared/contexts/`) - Estado global
2. **Apps** - Lógica de negocio específica
3. **Componentes** (`shared/components/`) - UI reutilizable

### Backend
1. **Routes** - Definición de endpoints
2. **Middleware** (`shared/middleware/`) - Validación y autenticación
3. **Services** (`shared/services/`) - Lógica de negocio compartida

## 📋 Convenciones de Nomenclatura

### Archivos
- `index.js` - Archivo principal de cada app
- `routes.js` - Definición de rutas (backend)
- `ComponentName.js` - Componentes React (PascalCase)

### Directorios
- `apps/` - Aplicaciones modulares
- `shared/` - Componentes y utilidades compartidas
- `auth/`, `patients/`, `doctors/`, `appointments/`, `admin/` - Apps específicas

## 🛠️ Agregar una Nueva App

### 1. Crear estructura de directorios
```bash
mkdir frontend/src/apps/nueva-app
mkdir backend/apps/nueva-app
```

### 2. Crear archivos de configuración
```javascript
// backend/apps/nueva-app/index.js
const express = require('express');
const router = express.Router();
const nuevaAppRoutes = require('./routes');

router.use('/nueva-app', nuevaAppRoutes);
module.exports = router;
```

### 3. Registrar en el servidor
```javascript
// backend/server.js
const nuevaApp = require('./apps/nueva-app');
app.use('/api', nuevaApp);
```

### 4. Crear componentes del frontend
```javascript
// frontend/src/apps/nueva-app/index.js
export { default as NuevoComponente } from './NuevoComponente';
```

## 🔍 Debugging

### Frontend
- Cada app puede tener su propio estado de desarrollo
- Console logs específicos por app
- Testing aislado por funcionalidad

### Backend
- Logs específicos por app
- Middleware de logging por ruta
- Testing unitario por módulo

## 📚 Documentación por App

Cada app debería tener su propia documentación:

- **auth/** - Autenticación y autorización
- **patients/** - Gestión de pacientes y perfiles
- **doctors/** - Gestión de doctores y especialidades
- **appointments/** - Gestión de citas y agenda
- **admin/** - Panel de administración y reportes

## 🚀 Próximos Pasos

1. **Testing** - Implementar tests unitarios por app
2. **Documentación** - Documentación específica por app
3. **Optimización** - Lazy loading de apps
4. **Monorepo** - Considerar estructura de monorepo para escalabilidad 