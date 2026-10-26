import { AppDataSource } from '../config/db.js';
import { UsuarioSchema } from '../entities/Usuario.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        const usuarioRepository = AppDataSource.getRepository(UsuarioSchema);
        
        // 1. Buscamos si el correo existe en la base de datos
        const usuario = await usuarioRepository.createQueryBuilder('usuario')
            .addSelect('usuario.password')
            .where('lower(usuario.correo) = lower(:correo)', { correo })
            .getOne();
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        if (usuario.estatus !== 'activo') {
            return res.status(403).json({ message: 'Usuario inactivo' });
        }

        // 2. Comparamos la contraseña escrita con la encriptada en la base de datos
        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        // 3. Si todo está bien, generamos el Token JWT (válido por 2 horas)
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({ mensaje: "Login exitoso", token });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: "Error al iniciar sesión" });
    }
};
