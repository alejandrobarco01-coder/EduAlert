import nodemailer from 'nodemailer';

// Variable global para almacenar el transportador
let transporter;

// Inicializa el transportador dinámicamente
const initTransporter = async () => {
  if (transporter) return transporter;
  
  // Si tenemos credenciales (como un app password de Gmail) en las variables de entorno
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail', // Por defecto usamos Gmail
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('  ✉️ [Email] Usando cuenta de correo real (Gmail/SMTP) configurada');
  } else {
    // Modo de prueba para previsualizar el correo (WOW factor)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('  ✉️ [Email] Usando cuenta de prueba Ethereal para testing local');
  }
  return transporter;
};

export const sendWelcomeEmail = async (studentEmail, studentName, tutorName) => {
  try {
    const t = await initTransporter();
    
    const info = await t.sendMail({
      from: '"EduAlert" <noreply@edualert.edu.co>',
      to: studentEmail,
      subject: '¡Bienvenido a EduAlert!',
      text: `Hola ${studentName},\n\nTu registro en EduAlert ha sido exitoso.\nTu tutor asignado es: ${tutorName}.\n\nPuedes acceder al sistema en: http://localhost:5173\n\nPróximos pasos: Completa tu encuesta socioeconómica en el sistema.\n\nSaludos,\nEl equipo de EduAlert`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #0d6efd;">¡Bienvenido a EduAlert!</h2>
          <p>Hola <strong>${studentName}</strong>,</p>
          <p>Tu registro en la plataforma EduAlert ha sido exitoso.</p>
          <p>Te informamos que tu tutor asignado es: <strong>${tutorName}</strong>.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173" style="display: inline-block; padding: 12px 24px; background-color: #0d6efd; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Acceder al Sistema</a>
          </p>
          <h3>Próximos pasos:</h3>
          <ul>
            <li>Inicia sesión en la plataforma.</li>
            <li>Completa tu encuesta socioeconómica para poder brindarte el mejor acompañamiento posible.</li>
          </ul>
          <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">Este es un mensaje automático, por favor no respondas a este correo.</p>
        </div>
      `
    });
    console.log(`\n  ✅ [Email] Correo de bienvenida enviado a ${studentEmail}: ${info.messageId}`);
    // Solo mostramos la previsualización si estamos usando la cuenta de prueba de Ethereal
    if (!process.env.EMAIL_USER) {
      console.log(`  👀 [Email] => PREVISUALIZAR CORREO AQUÍ: ${nodemailer.getTestMessageUrl(info)}\n`);
    }
    return true;
  } catch (error) {
    console.error('[Email] Error enviando correo de bienvenida:', error.message);
    // Retornamos falso pero no lanzamos el error para no afectar el flujo principal
    return false;
  }
};
