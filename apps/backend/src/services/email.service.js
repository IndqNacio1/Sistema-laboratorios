import nodemailer from 'nodemailer';

// 1. Usamos Ethereal en lugar de Gmail para hacer pruebas rápidas y seguras
export const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'fernando.moore@ethereal.email', // El Username que generaste
        pass: 'pAg2XHStU2aGAD6zMh'             // El Password que generaste
    }
});
export const notificarResultadosListos = async (correoPaciente, nombrePaciente) => {
  try {
    const info = await transporter.sendMail({
      from: '"Laboratorios INDQ" <laboratorio@indq.com>',
      to: correoPaciente, 
      subject: "Tus resultados médicos están listos 🩺", 
      text: `Hola ${nombrePaciente}, tus resultados ya están disponibles en el sistema.`, 
      html: `
        <h3>Hola ${nombrePaciente}</h3>
        <p>Te informamos que tus resultados de laboratorio ya han sido procesados y están disponibles.</p>
        <p>Atentamente,<br><b>El equipo de Laboratorios INDQ</b></p>
      ` 
    });
    
    // Ethereal nos da un link mágico para ver cómo quedó el correo
    console.log("Correo enviado con éxito. URL para verlo: %s", nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error("Error enviando el correo:", error);
    throw error;
  }
};