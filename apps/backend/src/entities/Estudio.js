import { EntitySchema } from "typeorm";

export const EstudioSchema = new EntitySchema({
    name: "Estudio",
    tableName: "estudios",
    columns: {
        id: { primary: true, type: "uuid", generated: "uuid" },
        nombre: { type: "varchar", length: 150 },
        descripcion: { type: "text", nullable: true },
        precio: { type: "decimal", precision: 10, scale: 2 },
        created_at: { type: "timestamp", createDate: true },
        updated_at: { type: "timestamp", updateDate: true }
    }
});