import { AppDataSource } from '../config/db.js';
import { UsuarioSchema } from '../entities/Usuario.js';
import bcrypt from 'bcryptjs';


export const createUsuario = async (req, res) => {
    try {
        const { nombre, correo, password, rol } = req.body;
        const roles = ['administrador', 'supervisor', 'operativo', 'recepcion'];
        if (typeof nombre !== 'string' || !nombre.trim() || nombre.trim().length > 100
            || typeof correo !== 'string' || correo.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())
            || typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72
            || (rol && !roles.includes(rol))) {
            return res.status(400).json({ message: 'Revisa el nombre, correo, contrasena y rol del usuario.' });
        }
        const usuarioRepository = AppDataSource.getRepository(UsuarioSchema);

        // --- NUEVO: Encriptar la contraseña ---
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        const nuevoUsuario = usuarioRepository.create({
            nombre: nombre.trim(),
            correo: correo.trim().toLowerCase(),
            password: passwordEncriptada, // Guardamos la versión encriptada
            rol: rol || 'recepcion'
        });

        const resultado = await usuarioRepository.save(nuevoUsuario);
        
        // Ocultamos la contraseña encriptada sin usar 'delete'
        resultado.password = undefined; 
        res.status(201).json(resultado);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'El correo ya esta registrado.' });
        }
        res.status(500).json({ message: "Error al guardar el usuario" });
    }
};


export const getUsuarios = async (req, res) => {
    try {
        // Obtenemos el repositorio de tu entidad Usuario
        const usuarioRepository = AppDataSource.getRepository(UsuarioSchema);
        
        // Buscamos todos los registros en la tabla
        const usuarios = await usuarioRepository.find();
        
        // Los enviamos como respuesta en formato JSON
        res.json(usuarios);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

