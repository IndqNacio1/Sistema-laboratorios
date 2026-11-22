export const autorizarRoles = (...rolesPermitidos) => {
    const permitidosNormalizados = rolesPermitidos.map((r) => r.toLowerCase());

    return (req, res, next) => {
        if (!req.usuario || !req.usuario.rol) {
            return res.status(401).json({ error: "Token no válido o sesión expirada." });
        }

        const rolUsuario = String(req.usuario.rol).toLowerCase();
        if (!permitidosNormalizados.includes(rolUsuario)) {
            return res.status(403).json({
                error: "Acceso denegado. No tienes los permisos necesarios para realizar esta acción."
            });
        }

        next();
    };
};