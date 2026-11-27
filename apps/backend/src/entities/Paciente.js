import { EntitySchema } from "typeorm";

export const PacienteSchema = new EntitySchema({
  name: "Paciente",
  tableName: "pacientes",
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
    fecha_nacimiento: {
      type: "date",
      nullable: true,
    },
    telefono: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
    },
  },
});