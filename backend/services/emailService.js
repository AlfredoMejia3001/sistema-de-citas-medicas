const nodemailer = require('nodemailer');
const cron = require('node-cron');

let transporter;

// Configurar el servicio de email
const setupEmailService = async () => {
  try {
    transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verificar conexión
    await transporter.verify();
    console.log('✅ Servicio de email configurado correctamente');

    // Configurar tareas programadas
    setupScheduledTasks();

  } catch (error) {
    console.error('❌ Error configurando servicio de email:', error);
    throw error;
  }
};

// Configurar tareas programadas
const setupScheduledTasks = () => {
  // Enviar recordatorios diariamente a las 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    try {
      await sendDailyReminders();
    } catch (error) {
      console.error('Error enviando recordatorios diarios:', error);
    }
  });

  console.log('📅 Tareas programadas configuradas');
};

// Enviar recordatorios diarios
const sendDailyReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    const { query } = require('../config/database');
    
    const result = await query(`
      SELECT 
        a.id, a.appointment_date, a.appointment_time,
        p.name as patient_name, p.email as patient_email,
        d.name as doctor_name, d.email as doctor_email,
        doc.specialty
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
      JOIN doctors doc ON a.doctor_id = doc.user_id
      WHERE a.appointment_date = $1 
      AND a.status IN ('scheduled', 'confirmed')
    `, [tomorrowDate]);

    for (const appointment of result.rows) {
      await sendAppointmentReminder(
        appointment.patient_email,
        appointment.patient_name,
        appointment.doctor_name,
        appointment.appointment_date,
        appointment.appointment_time,
        appointment.specialty
      );
    }

    console.log(`📧 Enviados ${result.rows.length} recordatorios para mañana`);
  } catch (error) {
    console.error('Error enviando recordatorios diarios:', error);
  }
};

// Email de bienvenida
const sendWelcomeEmail = async (email, name) => {
  if (!transporter) {
    console.warn('Servicio de email no configurado');
    return;
  }

  const mailOptions = {
    from: `"Sistema de Citas Médicas" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '¡Bienvenido al Sistema de Citas Médicas!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">¡Bienvenido, ${name}!</h2>
        <p>Gracias por registrarte en nuestro sistema de gestión de citas médicas.</p>
        <p>Ahora puedes:</p>
        <ul>
          <li>Buscar doctores disponibles</li>
          <li>Programar citas médicas</li>
          <li>Gestionar tus citas existentes</li>
          <li>Recibir recordatorios por email</li>
        </ul>
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <p>Saludos,<br>El equipo de Citas Médicas</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de bienvenida enviado a ${email}`);
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
    throw error;
  }
};

// Email de confirmación de cita
const sendAppointmentConfirmation = async (email, patientName, doctorName, date, time, specialty) => {
  if (!transporter) {
    console.warn('Servicio de email no configurado');
    return;
  }

  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: `"Sistema de Citas Médicas" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Confirmación de Cita Médica',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">✅ Cita Confirmada</h2>
        <p>Hola ${patientName},</p>
        <p>Tu cita médica ha sido programada exitosamente.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Detalles de la Cita</h3>
          <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p><strong>Especialidad:</strong> ${specialty}</p>
          <p><strong>Fecha:</strong> ${formattedDate}</p>
          <p><strong>Hora:</strong> ${time}</p>
        </div>
        
        <p>Recuerda:</p>
        <ul>
          <li>Llegar 10 minutos antes de tu cita</li>
          <li>Traer tu identificación</li>
          <li>Si necesitas cancelar, hazlo con al menos 24 horas de anticipación</li>
        </ul>
        
        <p>Recibirás un recordatorio 24 horas antes de tu cita.</p>
        <p>Saludos,<br>El equipo de Citas Médicas</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Confirmación de cita enviada a ${email}`);
  } catch (error) {
    console.error('Error enviando confirmación de cita:', error);
    throw error;
  }
};

// Email de recordatorio de cita
const sendAppointmentReminder = async (email, patientName, doctorName, date, time, specialty) => {
  if (!transporter) {
    console.warn('Servicio de email no configurado');
    return;
  }

  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: `"Sistema de Citas Médicas" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Recordatorio: Tu cita médica es mañana',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">⏰ Recordatorio de Cita</h2>
        <p>Hola ${patientName},</p>
        <p>Te recordamos que tienes una cita médica mañana.</p>
        
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404; margin-top: 0;">Detalles de la Cita</h3>
          <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p><strong>Especialidad:</strong> ${specialty}</p>
          <p><strong>Fecha:</strong> ${formattedDate}</p>
          <p><strong>Hora:</strong> ${time}</p>
        </div>
        
        <p><strong>Importante:</strong></p>
        <ul>
          <li>Llega 10 minutos antes de tu cita</li>
          <li>Trae tu identificación</li>
          <li>Si no puedes asistir, cancela con anticipación</li>
        </ul>
        
        <p>¡Esperamos verte pronto!</p>
        <p>Saludos,<br>El equipo de Citas Médicas</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Recordatorio enviado a ${email}`);
  } catch (error) {
    console.error('Error enviando recordatorio:', error);
    throw error;
  }
};

// Email de cancelación de cita
const sendCancellationEmail = async (email, patientName, doctorName, date, time) => {
  if (!transporter) {
    console.warn('Servicio de email no configurado');
    return;
  }

  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: `"Sistema de Citas Médicas" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Cita Médica Cancelada',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">❌ Cita Cancelada</h2>
        <p>Hola ${patientName},</p>
        <p>Tu cita médica ha sido cancelada.</p>
        
        <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <h3 style="color: #721c24; margin-top: 0;">Detalles de la Cita Cancelada</h3>
          <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p><strong>Fecha:</strong> ${formattedDate}</p>
          <p><strong>Hora:</strong> ${time}</p>
        </div>
        
        <p>Si necesitas reprogramar tu cita, puedes hacerlo desde tu cuenta en cualquier momento.</p>
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <p>Saludos,<br>El equipo de Citas Médicas</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de cancelación enviado a ${email}`);
  } catch (error) {
    console.error('Error enviando email de cancelación:', error);
    throw error;
  }
};

module.exports = {
  setupEmailService,
  sendWelcomeEmail,
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendCancellationEmail
}; 