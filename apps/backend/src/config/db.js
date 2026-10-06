import { DataSource } from "typeorm";
import dotenv from "dotenv";

// Cargamos las variables de entorno de tu archivo .env
dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD, // Asegúrate de tener esto en tu .env
    database: process.env.DB_NAME || "laboratorio_db",
    
    // IMPORTANTE: Lo ponemos en 'false' porque ya creaste las tablas manualmente en Beekeeper. 
    // Si estuviera en 'true', TypeORM intentaría borrar o sobreescribir tus tablas.
    synchronize: false, 
    
    logging: true, // Para ver las consultas SQL en la terminal
    entities: ["src/entities/*.js"], // Le decimos dónde van a estar tus modelos
});