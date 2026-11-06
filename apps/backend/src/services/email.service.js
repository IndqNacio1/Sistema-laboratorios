import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Asegurarnos de que lea el archivo .env
dotenv.config();

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // true para el puerto 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const notificarResultadosListos = async (destinatario, asunto, texto) => {
    try {
        await transporter.sendMail({
            from: `"Sistema de Laboratorio" <${process.env.SMTP_USER}>`,
            to: destinatario,
            subject: asunto,
            text: texto,
        });
        console.log("Correo enviado con éxito a:", destinatario);
    } catch (error) {
        console.error("Error al enviar el correo:", error);
    }
};