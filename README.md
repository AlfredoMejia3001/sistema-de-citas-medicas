# Sistema de Gestión de Citas Médicas

Una aplicación full stack para programar y gestionar citas médicas con autenticación JWT y notificaciones por email.

## 🚀 Características

- **Frontend**: React con interfaz moderna y responsive
- **Backend**: Node.js con Express y API REST
- **Base de datos**: PostgreSQL en Docker para fácil setup
- **Autenticación**: JWT para pacientes y doctores
- **Notificaciones**: Envío de recordatorios por email con Nodemailer
- **Gestión completa**: Crear, listar, actualizar y eliminar citas

## 📁 Estructura del Proyecto

```
sistema-de-citas-medicas/
├── frontend/                    # Aplicación React
│   ├── src/
│   │   ├── apps/               # Aplicaciones modulares
│   │   │   ├── auth/           # Autenticación
│   │   │   ├── patients/       # Gestión de pacientes
│   │   │   ├── doctors/        # Gestión de doctores
│   │   │   ├── appointments/   # Gestión de citas
│   │   │   └── admin/          # Panel de administración
│   │   ├── shared/             # Componentes y utilidades compartidas
│   │   │   ├── components/     # Componentes UI reutilizables
│   │   │   ├── contexts/       # Contextos de React
│   │   │   └── utils/          # Utilidades y helpers
│   │   └── App.js              # Componente principal
│   └── package.json
├── backend/                     # API Node.js/Express
│   ├── apps/                   # Aplicaciones modulares
│   │   ├── auth/               # Autenticación
│   │   ├── patients/           # Gestión de pacientes
│   │   ├── doctors/            # Gestión de doctores
│   │   ├── appointments/       # Gestión de citas
│   │   └── admin/              # Panel de administración
│   ├── shared/                 # Utilidades compartidas
│   │   ├── middleware/         # Middlewares
│   │   ├── services/           # Servicios (email, etc.)
│   │   └── utils/              # Utilidades y helpers
│   └── server.js               # Servidor principal
├── database/                   # Scripts de base de datos
├── docker-compose.yml          # Configuración Docker
└── README.md                   # Documentación
```

## 🛠️ Instalación

### Prerrequisitos
- Node.js (v16 o superior)
- Docker y Docker Compose
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/AlfredoMejia3001/sistema-de-citas-medicas.git
cd sistema-de-citas-medicas
```

### 2. Iniciar la base de datos con Docker
```bash
# Iniciar PostgreSQL y pgAdmin
docker-compose up -d

# Verificar que los contenedores estén corriendo
docker-compose ps
```

### 3. Instalar dependencias
```bash
npm run install:all
```

### 4. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp backend/env.example backend/.env

# Editar las variables según tu configuración
# Las credenciales de la base de datos ya están configuradas para Docker
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

## 🐳 Docker Setup

### Iniciar servicios
```bash
# Iniciar solo la base de datos
docker-compose up -d postgres

# Iniciar base de datos + pgAdmin
docker-compose up -d
```

### Acceder a pgAdmin
- URL: http://localhost:5050
- Email: admin@medical.com
- Password: admin123

### Configurar conexión en pgAdmin
1. Click derecho en "Servers" → "Register" → "Server"
2. General tab:
   - Name: Medical Appointments
3. Connection tab:
   - Host: postgres
   - Port: 5432
   - Database: medical_appointments
   - Username: postgres
   - Password: postgres123

### Comandos útiles
```bash
# Ver logs de la base de datos
docker-compose logs postgres

# Reiniciar solo la base de datos
docker-compose restart postgres

# Detener todos los servicios
docker-compose down

# Eliminar volúmenes (cuidado: borra todos los datos)
docker-compose down -v
```

## 🔧 Configuración

### Variables de Entorno (Backend)

Crea un archivo `.env` en la carpeta `backend/`:

```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de datos PostgreSQL (Docker)
DB_HOST=localhost
DB_PORT=5433
DB_NAME=medical_appointments
DB_USER=postgres
DB_PASSWORD=postgres123

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_cambiar_en_produccion
JWT_EXPIRES_IN=24h

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_de_gmail

# Frontend URL para CORS
FRONTEND_URL=http://localhost:3000
```

## 📚 API Endpoints

### Autenticación (`/api/auth`)
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Login de usuarios
- `GET /api/auth/me` - Obtener perfil actual

### Pacientes (`/api/patients`)
- `GET /api/patients/history/:patientId` - Historial médico del paciente
- `POST /api/patients/history` - Crear entrada en historial médico

### Doctores (`/api/doctors`)
- `GET /api/doctors` - Listar todos los doctores
- `GET /api/doctors/:id` - Obtener doctor específico
- `POST /api/doctors` - Crear doctor (admin)
- `PUT /api/doctors/:id` - Actualizar doctor
- `DELETE /api/doctors/:id` - Eliminar doctor

### Citas (`/api/appointments`)
- `GET /api/appointments` - Listar citas del usuario
- `GET /api/appointments/:id` - Obtener cita específica
- `POST /api/appointments` - Crear nueva cita
- `PUT /api/appointments/:id` - Actualizar cita
- `DELETE /api/appointments/:id` - Cancelar cita

### Administración (`/api/admin`)
- `GET /api/admin/stats` - Estadísticas del sistema
- `GET /api/admin/users` - Lista de usuarios

## 🎯 Funcionalidades

### Para Pacientes
- Registro e inicio de sesión
- Ver lista de doctores disponibles
- Programar citas médicas
- Ver historial de citas
- Cancelar citas
- Gestionar perfil personal
- Recibir recordatorios por email

### Para Doctores
- Panel de administración personal
- Ver agenda de citas
- Gestionar disponibilidad
- Confirmar/cancelar citas
- Ver historial médico de pacientes
- Gestionar perfil profesional

### Para Administradores
- Gestión completa de doctores
- Ver todas las citas del sistema
- Estadísticas y reportes
- Gestión de usuarios
- Panel de administración avanzado

## 🏗️ Arquitectura Modular

El proyecto está organizado en una arquitectura modular tipo Django:

### Frontend Apps
- **`auth/`** - Autenticación y registro
- **`patients/`** - Gestión de pacientes y perfiles
- **`doctors/`** - Listado y gestión de doctores
- **`appointments/`** - Gestión de citas y dashboard
- **`admin/`** - Panel de administración

### Backend Apps
- **`auth/`** - Autenticación JWT
- **`patients/`** - API de pacientes e historial médico
- **`doctors/`** - API de doctores
- **`appointments/`** - API de citas
- **`admin/`** - API de administración

### Shared Components
- **`middleware/`** - Middlewares de autenticación y validación
- **`services/`** - Servicios compartidos (email, etc.)
- **`utils/`** - Utilidades y helpers
- **`contexts/`** - Contextos de React
- **`components/`** - Componentes UI reutilizables

## 🛡️ Seguridad

- Autenticación JWT
- Validación de datos
- Sanitización de inputs
- Rate limiting
- CORS configurado

## 📧 Notificaciones

El sistema envía automáticamente:
- Confirmación de cita al programarla
- Recordatorio 24h antes de la cita
- Notificación de cancelación

## 🚀 Despliegue

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
```

### Backend (Heroku/Railway)
```bash
cd backend
npm start
```

### Base de datos en producción
- Usar PostgreSQL en la nube (Heroku Postgres, AWS RDS, etc.)
- Actualizar variables de entorno con las credenciales de producción

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles. 