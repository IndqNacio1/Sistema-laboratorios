import { EntitySchema } from "typeorm";

export const UsuarioSchema = new EntitySchema({
    name: "Usuario",
    tableName: "usuarios",
    columns: {
        id: {
            primary: true,
            type: "uuid",
            generated: "uuid",
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
        activo: {
            type: "boolean",
            default: true,
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