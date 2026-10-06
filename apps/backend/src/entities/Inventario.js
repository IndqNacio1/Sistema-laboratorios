import { EntitySchema } from "typeorm";

export const InventarioSchema = new EntitySchema({
    name: "Inventario",
    tableName: "inventario",
    columns: {
        id: { primary: true, type: "uuid", generated: "uuid" },
        articulo: { type: "varchar", length: 150 },
        cantidad: { type: "int" },
        unidad_medida: { type: "varchar", length: 50 },
        created_at: { type: "timestamp", createDate: true },
        updated_at: { type: "timestamp", updateDate: true }
    }
});