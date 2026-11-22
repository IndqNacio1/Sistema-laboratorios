import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/db.js";
import { UsuarioSchema } from "../entities/Usuario.js";

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("FATAL: JWT_SECRET no está definido en las variables de entorno.");
    }
    return secret;
};

export const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({ error: "Por favor ingresa correo y contraseña." });
        }

        const usuarioRepository = AppDataSource.getRepository(UsuarioSchema);
        const usuario = await usuarioRepository.findOne({
            where: { correo: correo.trim().toLowerCase() }
        });

        if (!usuario) {
            return res.status(401).json({ error: "Credenciales inválidas." });
        }

        // Validar que la cuenta esté activa (si existe la propiedad activo en la entidad)
        if (usuario.activo === false) {
            return res.status(403).json({ error: "Tu cuenta está desactivada. Contacta al administrador." });
        }

        // Validación con bcrypt (si aún existe algún usuario seed viejo sin hash, puedes migrarlo en BD)
        const esHashBcrypt = usuario.password?.startsWith("$2b$") || usuario.password?.startsWith("$2a$");
        const passwordValido = esHashBcrypt
            ? await bcrypt.compare(password, usuario.password)
            : password === usuario.password;

        if (!passwordValido) {
            return res.status(401).json({ error: "Credenciales inválidas." });
        }

        const payload = {
            id: usuario.id,
            rol: usuario.rol,
            correo: usuario.correo,
            ...(usuario.sucursalId && { sucursalId: usuario.sucursalId })
        };

        const token = jwt.sign(payload, getJwtSecret(), { expiresIn: "8h" });

        return res.status(200).json({
            mensaje: "Inicio de sesión exitoso",
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol,
                ...(usuario.sucursalId && { sucursalId: usuario.sucursalId })
            }
        });
    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ error: "Error interno del servidor al iniciar sesión." });
    }
};