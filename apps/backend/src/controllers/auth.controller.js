import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/db.js";
import { UsuarioSchema } from "../entities/Usuario.js"; // Ajusta si tu entidad se llama distinto
// import bcrypt from "bcrypt"; // Descomenta esto si tus contraseñas están encriptadas

const SECRET_KEY = process.env.JWT_SECRET || "secreto_super_seguro_laboratorio";

export const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({ error: "Por favor ingresa correo y contraseña." });
        }

        const usuarioRepository = AppDataSource.getRepository(UsuarioSchema);
        const usuario = await usuarioRepository.findOne({ where: { correo } });

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        // Si usas contraseñas encriptadas con bcrypt, usa esta validación:
        // const passwordValido = await bcrypt.compare(password, usuario.password);
        // Si no las tienes encriptadas aún, usamos una comparación simple:
        const passwordValido = (password === usuario.password);

        if (!passwordValido) {
            return res.status(401).json({ error: "Contraseña incorrecta." });
        }

        // 1. Generamos el Token con los datos básicos del usuario
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol, correo: usuario.correo },
            SECRET_KEY,
            { expiresIn: "8h" } // El token expira en 8 horas (una jornada laboral)
        );

        // 2. Respondemos con éxito y enviamos el token
        res.status(200).json({
            mensaje: "Inicio de sesión exitoso",
            token: token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error interno del servidor al iniciar sesión." });
    }
};