import { EntitySchema } from "typeorm";

export const SucursalSchema = new EntitySchema({
    name: "Sucursal",
    tableName: "sucursales",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        nombre: {
            type: "varchar",
            length: 100,
            nullable: false
        },
        direccion: {
            type: "text",
            nullable: false
        },
        telefono: {
            type: "varchar",
            length: 20,
            nullable: true
        },
        activa: {
            type: "boolean",
            default: true
        },
        fecha_creacion: {
            type: "timestamp",
            createDate: true
        }
    }
});