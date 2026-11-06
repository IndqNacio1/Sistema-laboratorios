import jwt from "jsonwebtoken";

// Clave secreta (por ahora aquí, después se pasa al archivo .env)
const SECRET_KEY = process.env.JWT_SECRET || "secreto_super_seguro_laboratorio";

export const verificarToken = (req, res, next) => {
    const tokenHeader = req.headers["authorization"];

    if (!tokenHeader) {
        return res.status(403).json({ error: "No se proporcionó un token de acceso." });
    }

    const token = tokenHeader.split(" ")[1]; // Separa "Bearer" del token real

    if (!token) {
        return res.status(403).json({ error: "Formato de token inválido." });
    }

    try {
        const decodificado = jwt.verify(token, SECRET_KEY);
        req.usuario = decodificado; // Guardamos los datos del usuario para usarlos en los controladores
        next(); // Permite que la petición continúe
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado." });
    }
};