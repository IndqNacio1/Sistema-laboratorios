import { EntitySchema } from "typeorm";

export const PagoSchema = new EntitySchema({
    name: "Pago",
    tableName: "pagos",
    columns: {
        id: { 
            primary: true, 
            type: "uuid", 
            generated: "uuid" 
        },
        estudio_id: { 
            type: "uuid", 
            nullable: false // Para saber qué estudio se está pagando
        },
        monto: { 
            type: "decimal", 
            precision: 10, 
            scale: 2, 
            nullable: false 
        },
        metodo_pago: { 
            type: "varchar", 
            length: 50, 
            nullable: false // Efectivo, Tarjeta, Transferencia, etc.
        },
        estatus: { 
            type: "varchar", 
            default: "Completado" 
        },
        fecha_pago: { 
            type: "timestamp", 
            createDate: true 
        }
    }
});