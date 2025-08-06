# 🏥 Sistema de Citas Médicas

Un sistema completo de gestión de citas médicas desarrollado con **React** (frontend) y **Node.js** (backend), con base de datos **PostgreSQL** y contenedores **Docker**.

## 📋 Descripción

Este sistema permite la gestión integral de citas médicas entre pacientes y doctores, incluyendo:

- **Registro y autenticación** de usuarios (pacientes y doctores)
- **Gestión de citas** con programación, confirmación y cancelación
- **Historial médico** completo de pacientes
- **Seguimientos médicos** y recordatorios
- **Documentos médicos** (prescripciones, reportes, etc.)
- **Panel de administración** para gestión del sistema
- **Notificaciones por email** automáticas

## 🏗️ Arquitectura del Sistema

### Frontend (React)
- **React 18** con hooks y context API
- **React Router** para navegación
- **Tailwind CSS** para estilos
- **Axios** para comunicación con API (configurado con interceptores)
- **React Hook Form** para formularios
- **Lucide React** para iconos
- **React Hot Toast** para notificaciones

### Backend (Node.js)
- **Express.js** como framework web
- **JWT** para autenticación
- **bcryptjs** para encriptación de contraseñas
- **express-validator** para validación de datos
- **nodemailer** para envío de emails
- **multer** para manejo de archivos
- **node-cron** para tareas programadas

### Base de Datos
- **PostgreSQL** como base de datos principal
- **Docker** para contenerización
- **pgAdmin** para administración de BD

### Infraestructura
- **Docker Compose** para orquestación de servicios
- **Concurrently** para ejecutar frontend y backend simultáneamente

## 🗄️ Estructura de la Base de Datos

### Tablas Principales
- **users**: Información básica de usuarios (pacientes, doctores, admin)
- **doctors**: Perfiles específicos de doctores (especialidad, licencia, tarifas)
- **appointments**: Citas médicas programadas
- **patient_medical_history**: Historial médico completo
- **medical_follow_ups**: Seguimientos médicos
- **medical_documents**: Documentos médicos (prescripciones, reportes)
- **patient_conditions**: Alergias y condiciones médicas

### Características de la BD
- **Triggers automáticos** para actualización de timestamps
- **Índices optimizados** para consultas frecuentes
- **Vistas predefinidas** para reportes comunes
- **Restricciones de integridad** referencial

## 👨‍⚕️ Doctores Disponibles

El sistema incluye **10 doctores** con diferentes especialidades:

### Doctores Originales
1. **Dr. María González** - Cardiología ($1,600.00 MXN)
2. **Dr. Carlos Rodríguez** - Dermatología ($1,400.00 MXN)
3. **Dr. Ana Martínez** - Pediatría ($1,200.00 MXN)
4. **Dr. Luis Fernández** - Ortopedia ($1,500.00 MXN)
5. **Dr. Carmen López** - Ginecología ($1,700.00 MXN)

### Doctores Agregados
6. **Dr. Roberto Silva** - Neurología ($1,800.00 MXN)
7. **Dr. Patricia Morales** - Psicología ($1,300.00 MXN)
8. **Dr. Javier Ruiz** - Oftalmología ($1,500.00 MXN)
9. **Dr. Isabel Vargas** - Endocrinología ($1,600.00 MXN)
10. **Dr. Manuel Torres** - Urología ($1,700.00 MXN)

**Credenciales de acceso para todos los doctores:**
- **Contraseña:** `admin123`

## 🚀 Funcionalidades Principales

### Para Pacientes
- ✅ Registro y login seguro
- ✅ Buscar doctores por especialidad
- ✅ Programar citas médicas desde la vista de doctores
- ✅ Ver historial médico personal
- ✅ Recibir notificaciones por email
- ✅ Gestionar perfil personal
- ✅ Ver citas programadas y pasadas

### Para Doctores
- ✅ Registro con validación de licencia
- ✅ Configurar horarios disponibles
- ✅ Gestionar citas programadas
- ✅ Registrar historial médico de pacientes
- ✅ Crear seguimientos médicos
- ✅ Subir documentos médicos

### Para Administradores
- ✅ Panel de administración completo
- ✅ Gestión de usuarios y doctores
- ✅ Reportes y estadísticas
- ✅ Configuración del sistema

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- Docker y Docker Compose
- Git

### Instalación Rápida
```bash
# Clonar el repositorio
git clone https://github.com/AlfredoMejia3001/sistema-de-citas-medicas.git
cd sistema-de-citas-medicas

# Configurar todo automáticamente
npm run setup

# Iniciar el sistema
npm run dev
```

### Instalación Manual
```bash
# 1. Levantar servicios de Docker
npm run docker:up

# 2. Instalar dependencias
npm run install:all

# 3. Iniciar desarrollo
npm run dev
```

## 📁 Estructura del Proyecto

```
sistema-de-citas-medicas/
├── backend/                 # API Node.js
│   ├── apps/               # Módulos de la aplicación
│   │   ├── auth/          # Autenticación
│   │   ├── appointments/  # Gestión de citas
│   │   ├── doctors/       # Gestión de doctores
│   │   ├── patients/      # Gestión de pacientes
│   │   └── admin/         # Panel administrativo
│   ├── shared/            # Utilidades compartidas
│   │   ├── middleware/    # Middlewares
│   │   ├── services/      # Servicios (email, etc.)
│   │   └── utils/         # Utilidades
│   └── server.js          # Servidor principal
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── apps/         # Módulos de la aplicación
│   │   ├── components/   # Componentes reutilizables
│   │   ├── contexts/     # Contextos de React
│   │   └── pages/        # Páginas principales
│   └── public/           # Archivos estáticos
├── database/             # Scripts de base de datos
│   ├── schema.sql       # Esquema de la BD
│   └── init.sql         # Datos iniciales
└── docker-compose.yml   # Configuración de Docker
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar frontend y backend
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend

# Docker
npm run docker:up        # Levantar contenedores
npm run docker:down      # Detener contenedores
npm run docker:logs      # Ver logs
npm run docker:restart   # Reiniciar contenedores

# Base de datos
npm run db:reset         # Resetear BD completamente

# Producción
npm run build            # Construir frontend
npm run start            # Iniciar solo backend
```

## 🌐 Puertos y URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **PostgreSQL**: localhost:5433
- **pgAdmin**: http://localhost:5050

## 🔐 Variables de Entorno

Crear archivo `.env` en el directorio `backend/`:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5433
DB_NAME=medical_appointments
DB_USER=postgres
DB_PASSWORD=postgres123

# JWT
JWT_SECRET=tu_secreto_jwt_super_seguro
JWT_EXPIRES_IN=24h

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion

# Servidor
PORT=5000
NODE_ENV=development
```

## 📊 Características Técnicas

### Seguridad
- ✅ Autenticación JWT con interceptores automáticos
- ✅ Encriptación de contraseñas (bcrypt)
- ✅ Validación de datos en frontend y backend
- ✅ Rate limiting para APIs
- ✅ Headers de seguridad (Helmet)
- ✅ Manejo automático de tokens expirados

### Rendimiento
- ✅ Índices optimizados en BD
- ✅ Paginación en consultas
- ✅ Caché de consultas frecuentes
- ✅ Compresión de respuestas
- ✅ Configuración centralizada de Axios

### Escalabilidad
- ✅ Arquitectura modular
- ✅ Separación de responsabilidades
- ✅ APIs RESTful
- ✅ Contenedores Docker

## 🐛 Correcciones Recientes

### Problemas Solucionados
- ✅ **Error de puertos ocupados**: Implementado manejo automático
- ✅ **Error de autenticación**: Corregido middleware JWT (`decoded.userId` → `decoded.id`)
- ✅ **Error de carga de doctores**: Removido requerimiento de autenticación para endpoint público
- ✅ **Loop de redirección**: Corregida lógica de rutas protegidas
- ✅ **Alertas innecesarias**: Eliminadas alertas de error cuando no hay citas
- ✅ **Configuración de Axios**: Centralizada con interceptores automáticos

### Mejoras Implementadas
- ✅ **10 doctores** con diferentes especialidades
- ✅ **Eliminación del botón "Nueva Cita"** de la vista de citas
- ✅ **Creación de citas** solo desde la vista de doctores
- ✅ **Manejo mejorado de errores** en frontend y backend
- ✅ **Logs de debug** para facilitar troubleshooting

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Login de usuarios
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/change-password` - Cambiar contraseña

### Citas
- `GET /api/appointments` - Listar citas del usuario
- `POST /api/appointments` - Crear cita
- `PUT /api/appointments/:id` - Actualizar cita
- `DELETE /api/appointments/:id` - Cancelar cita
- `GET /api/appointments/stats/overview` - Estadísticas de citas

### Doctores
- `GET /api/doctors` - Listar doctores (público)
- `GET /api/doctors/:id` - Obtener doctor específico
- `PUT /api/doctors/:id` - Actualizar doctor
- `GET /api/doctors/:id/availability` - Horarios disponibles

### Pacientes
- `GET /api/patients/history` - Historial médico
- `POST /api/patients/history` - Agregar entrada al historial

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **Alfredo Mejia** - *Desarrollo inicial* - [AlfredoMejia3001](https://github.com/AlfredoMejia3001)

## 🙏 Agradecimientos

- React y Node.js communities
- Tailwind CSS por los estilos
- PostgreSQL por la base de datos robusta
- Docker por la contenerización

---

## 🚀 Estado del Proyecto

- ✅ **Completado**: Sistema básico funcional con 10 doctores
- ✅ **Completado**: Corrección de errores de autenticación y carga
- ✅ **Completado**: Mejoras en UX (eliminación de botón innecesario)
- 🔄 **En desarrollo**: Tests unitarios y de integración
- 📋 **Pendiente**: Documentación de API completa

**Última actualización**: 5 de Agosto 2025 