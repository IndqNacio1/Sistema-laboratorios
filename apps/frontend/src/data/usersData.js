export const userStats = [
  {
    label: 'Usuarios activos',
    value: '18',
    detail: 'Cuentas disponibles para operar',
  },
  {
    label: 'Administradores',
    value: '3',
    detail: 'Acceso completo al sistema',
  },
  {
    label: 'Recepcion',
    value: '6',
    detail: 'Registro de pacientes y cobros',
  },
  {
    label: 'Pendientes',
    value: '2',
    detail: 'Cuentas por revisar',
  },
];

export const users = [
  {
    id: 'USR-001',
    nombre: 'Julio Lugo',
    correo: 'julio.lugo@laboratorio.com',
    rol: 'Administrador',
    sucursal: 'Matriz',
    estado: 'Activo',
  },
  {
    id: 'USR-002',
    nombre: 'Cristhian Marquez',
    correo: 'cristhian.marquez@laboratorio.com',
    rol: 'Supervisor',
    sucursal: 'Matriz',
    estado: 'Activo',
  },
  {
    id: 'USR-003',
    nombre: 'Ana Rivera',
    correo: 'ana.rivera@laboratorio.com',
    rol: 'Recepcion',
    sucursal: 'Sucursal Norte',
    estado: 'Activo',
  },
  {
    id: 'USR-004',
    nombre: 'Luis Torres',
    correo: 'luis.torres@laboratorio.com',
    rol: 'Operativo',
    sucursal: 'Sucursal Norte',
    estado: 'Pendiente',
  },
  {
    id: 'USR-005',
    nombre: 'Maria Lopez',
    correo: 'maria.lopez@laboratorio.com',
    rol: 'Recepcion',
    sucursal: 'Matriz',
    estado: 'Inactivo',
  },
];

export const userFilterOptions = {
  roles: ['Todos', 'Administrador', 'Supervisor', 'Recepcion', 'Operativo'],
  estados: ['Todos', 'Activo', 'Pendiente', 'Inactivo'],
  sucursales: ['Todas', 'Matriz', 'Sucursal Norte'],
};

export const emptyUserForm = {
  nombre: '',
  correo: '',
  rol: 'Recepcion',
  sucursal: 'Matriz',
  estado: 'Pendiente',
};

export const userActions = [
  'Editar informacion',
  'Cambiar estado',
  'Revisar permisos',
];
