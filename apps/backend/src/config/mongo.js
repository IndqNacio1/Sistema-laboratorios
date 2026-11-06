import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Usamos una variable de entorno o una base de datos local por defecto para los logs
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/laboratorio_logs";

export const conectarMongoDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("¡Conexión a la base de datos MongoDB (Logs) exitosa!");
    } catch (error) {
        console.error("Error al conectar a MongoDB:", error);
        // No detenemos el servidor si falla Mongo, permitimos que PostgreSQL siga funcionando
    }
};