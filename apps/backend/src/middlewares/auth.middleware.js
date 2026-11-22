import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error("FATAL: JWT_SECRET no está configurado en .env");
        return res.status(500).json({ error: "Error de configuración de seguridad en el servidor." });
    }

    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token de acceso no proporcionado o formato Bearer inválido." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token vacío." });
    }

    try {
        const decodificado = jwt.verify(token, secret);
        req.usuario = decodificado;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado." });
    }
};