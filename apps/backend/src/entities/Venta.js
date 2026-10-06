import { EntitySchema } from "typeorm";

export const VentaSchema = new EntitySchema({
    name: "Venta",
    tableName: "ventas",
    columns: {
        id: { primary: true, type: "uuid", generated: "uuid" },
        total: { type: "decimal", precision: 10, scale: 2 },
        estado: { type: "varchar", length: 50, default: "pagado" },
        created_at: { type: "timestamp", createDate: true },
        updated_at: { type: "timestamp", updateDate: true }
    }
});