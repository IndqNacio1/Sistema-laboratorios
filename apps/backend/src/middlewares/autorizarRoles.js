// src/middlewares/autorizarRoles.js

export const autorizarRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        // req.usuario ya debe existir gracias al middleware previo (verificarToken)
        if (!req.usuario) {
            return res.status(401).json({ error: "Token no válido o sesión expirada." });
        }

        // Verificamos si el rol del usuario está en la lista de permitidos para esta ruta
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ 
                error: "Acceso denegado. No tienes los permisos necesarios para realizar esta acción." 
            });
        }

        // Si el rol es correcto, lo dejamos pasar al controlador
        next();
    };
};