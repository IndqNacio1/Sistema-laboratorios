import { EntitySchema } from "typeorm";

export const InventarioSchema = new EntitySchema({
  name: "Inventario",
  tableName: "inventario",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid" },
    nombre_item: { type: "varchar", length: 150 },
    cantidad: { type: "int", default: 0 },
    unidad_medida: { type: "varchar", length: 50 },
    fecha_caducidad: { type: "date", nullable: true },
    created_at: { type: "timestamp", createDate: true },
    updated_at: { type: "timestamp", updateDate: true },
  },
});