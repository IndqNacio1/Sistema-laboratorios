import { EntitySchema } from "typeorm";

export const PacienteSchema = new EntitySchema({
    name: "Paciente",
    tableName: "pacientes", // El nombre de tu tabla en la base de datos
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
        apellidos: {
            type: "varchar",
            length: 100,
        },
        telefono: {
            type: "varchar",
            length: 20,
            nullable: true, // true por si el paciente no tiene teléfono
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