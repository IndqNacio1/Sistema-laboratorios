import { AppDataSource } from '../config/db.js';
import { UsuarioSchema } from '../entities/Usuario.js';
import bcrypt from 'bcryptjs';


export const createUsuario = async (req, res) => {
    try {
        const { nombre, correo, password, rol } = req.body;
        const usuarioRepository = AppDataSource.getRepository(UsuarioSchema);

        // --- NUEVO: Encriptar la contraseña ---
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        const nuevoUsuario = usuarioRepository.create({
            nombre,
            correo,
            password: passwordEncriptada, // Guardamos la versión encriptada
            rol: rol || 'recepcionista'
        });

        const resultado = await usuarioRepository.save(nuevoUsuario);
        
        // Ocultamos la contraseña encriptada sin usar 'delete'
        resultado.password = undefined; 
        res.status(201).json(resultado);
    } catch (error) {
        console.error("Error REAL detallado:", error); // <- Agregamos esto para depurar
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

