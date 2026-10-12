export const dashboardStats = [
  {
    label: 'Pacientes registrados',
    value: '128',
    detail: '24 nuevos esta semana',
  },
  {
    label: 'Estudios activos',
    value: '46',
    detail: '12 pendientes de resultado',
  },
  {
    label: 'Pagos del dia',
    value: '$18,420',
    detail: '32 operaciones registradas',
  },
  {
    label: 'Productos bajos',
    value: '7',
    detail: 'Requieren revision de inventario',
  },
];

export const recentStudies = [
  {
    folio: 'EST-0018',
    paciente: 'Maria Lopez',
    servicio: 'Biometria hematica',
    estado: 'En proceso',
    sucursal: 'Matriz',
  },
  {
    folio: 'EST-0019',
    paciente: 'Carlos Medina',
    servicio: 'Quimica sanguinea',
    estado: 'Pendiente de pago',
    sucursal: 'Matriz',
  },
  {
    folio: 'EST-0020',
    paciente: 'Ana Rivera',
    servicio: 'Examen general de orina',
    estado: 'Resultado listo',
    sucursal: 'Sucursal Norte',
  },
  {
    folio: 'EST-0021',
    paciente: 'Luis Torres',
    servicio: 'Perfil lipidico',
    estado: 'En proceso',
    sucursal: 'Sucursal Norte',
  },
];

export const moduleSummary = [
  {
    title: 'Recepcion',
    description: 'Registro de pacientes, captura de datos basicos y asignacion de estudios.',
  },
  {
    title: 'Punto de venta',
    description: 'Cobro de estudios, control de pagos y generacion de movimientos financieros.',
  },
  {
    title: 'Laboratorio',
    description: 'Seguimiento de estudios, resultados y estado operativo de cada solicitud.',
  },
];
