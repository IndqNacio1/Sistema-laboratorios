import { AppDataSource } from "../config/db.js";
import { UsuarioSchema } from "../entities/Usuario.js";
import bcrypt from "bcryptjs";

const ROLES_PERMITIDOS = ["admin", "administrador", "quimico", "recepcionista"];
const CAMPOS_SEGUROS = ["id", "nombre", "correo", "rol", "activo", "created_at", "updated_at"];

const esCorreoValido = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

export const createUsuario = async (req, res) => {
    try {
        const { nombre, correo, password, rol } = req.body;

        if (!nombre || !correo || !password) {
            return res.status(400).json({ error: "Nombre, correo y contraseña son obligatorios." });
        }

        const correoLimpio = correo.trim().toLowerCase();
        if (!esCorreoValido(correoLimpio)) {
            return res.status(400).json({ error: "El formato del correo electrónico no es válido." });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
        }

        const rolNormalizado = (rol || "recepcionista").trim().toLowerCase();
        if (!ROLES_PERMITIDOS.includes(rolNormalizado)) {
            return res.status(400).json({ error: `Rol no válido. Permitidos: ${ROLES_PERMITIDOS.join(", ")}` });
        }

        const usuarioRepository = AppDataSource.getRepository(UsuarioSchema);
        const existente = await usuarioRepository.findOne({ where: { correo: correoLimpio } });
        if (existente) {
            return res.status(409).json({ error: "Ya existe un usuario registrado con ese correo." });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        const nuevoUsuario = usuarioRepository.create({
            nombre: nombre.trim(),
            correo: correoLimpio,
            password: passwordEncriptada,
            rol: rolNormalizado,
            activo: true
        });

        const resultado = await usuarioRepository.save(nuevoUsuario);
        resultado.password = undefined;

        return res.status(201).json(resultado);
    } catch (error) {
        console.error("Error al guardar el usuario:", error);
        if (error.code === "23505") {
            return res.status(409).json({ error: "El correo electrónico ya está registrado." });
        }
        return res.status(500).json({ error: "Error interno al guardar el usuario." });
    }
};

export const getUsuarios = async (req, res) => {
    try {
        const usuarioRepository = AppDataSource.getRepository(UsuarioSchema);
        const usuarios = await usuarioRepository.find({
            select: CAMPOS_SEGUROS,
            order: { created_at: "DESC" }
        });
        return res.json(usuarios);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
};

export const getUsuarioById = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioRepository = AppDataSource.getRepository(UsuarioSchema);
        const usuario = await usuarioRepository.findOne({
            where: { id },
            select: CAMPOS_SEGUROS
        });

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        return res.json(usuario);
    } catch (error) {
        console.error("Error al obtener usuario por ID:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
};

export const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo, password, rol, activo } = req.body;

        const usuarioRepository = AppDataSource.getRepository(UsuarioSchema);
        const usuario = await usuarioRepository.findOne({ where: { id } });

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        if (correo) {
            const correoLimpio = correo.trim().toLowerCase();
            if (!esCorreoValido(correoLimpio)) {
                return res.status(400).json({ error: "El formato del correo no es válido." });
            }
            const duplicado = await usuarioRepository.findOne({ where: { correo: correoLimpio } });
            if (duplicado && duplicado.id !== id) {
                return res.status(409).json({ error: "Ese correo ya pertenece a otro usuario." });
            }
            usuario.correo = correoLimpio;
        }

        if (nombre) usuario.nombre = nombre.trim();

        if (rol) {
            const rolNormalizado = rol.trim().toLowerCase();
            if (!ROLES_PERMITIDOS.includes(rolNormalizado)) {
                return res.status(400).json({ error: "Rol no válido." });
            }
            usuario.rol = rolNormalizado;
        }

        if (typeof activo === "boolean") {
            if (req.usuario?.id === id && activo === false) {
                return res.status(400).json({ error: "No puedes desactivar tu propia cuenta." });
            }
            usuario.activo = activo;
        }

        if (password && password.trim().length > 0) {
            if (password.length < 6) {
                return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
            }
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(password, salt);
        }

        const actualizado = await usuarioRepository.save(usuario);
        actualizado.password = undefined;

        return res.json(actualizado);
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        return res.status(500).json({ error: "Error interno al actualizar el usuario." });
    }
};

export const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.usuario?.id === id) {
            return res.status(400).json({ error: "No puedes dar de baja tu propia cuenta." });
        }

        const usuarioRepository = AppDataSource.getRepository(UsuarioSchema);
        const usuario = await usuarioRepository.findOne({ where: { id } });

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        usuario.activo = false;
        await usuarioRepository.save(usuario);

        return res.json({ mensaje: "Usuario desactivado correctamente.", id });
    } catch (error) {
        console.error("Error al desactivar usuario:", error);
        return res.status(500).json({ error: "Error interno al desactivar el usuario." });
    }
};