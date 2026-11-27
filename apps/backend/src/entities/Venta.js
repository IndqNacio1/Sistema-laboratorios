import { EntitySchema } from "typeorm";

export const VentaSchema = new EntitySchema({
  name: "Venta",
  tableName: "ventas",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid" },
    paciente_id: { type: "uuid", nullable: true },
    usuario_id: { type: "uuid", nullable: true },
    total: { type: "decimal", precision: 10, scale: 2 },
    estado_pago: { type: "varchar", length: 50, default: "pendiente" },
    created_at: { type: "timestamp", createDate: true },
    updated_at: { type: "timestamp", updateDate: true },
  },
});