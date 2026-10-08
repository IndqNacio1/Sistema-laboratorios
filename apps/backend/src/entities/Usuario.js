import { EntitySchema } from "typeorm";

export const UsuarioSchema = new EntitySchema({
    name: "Usuario", // Nombre del modelo en tu código
    tableName: "usuarios", // El nombre EXACTO de la tabla en tu base de datos
    columns: {
        id: {
            primary: true,
            type: "uuid",
            generated: "uuid", // Para que coincida con tu gen_random_uuid()
        },
        nombre: {
            type: "varchar",
            length: 100,
        },
        correo: {
            type: "varchar",
            length: 100,
            unique: true,
        },
        password: {
            type: "varchar",
            length: 255,
        },
        rol: {
            type: "varchar",
            length: 50,
            default: "recepcionista",
        },
        created_at: {
            type: "timestamp",
            createDate: true,
        },
        updated_at: {
            type: "timestamp",
            updateDate: true,
        }
    }
});