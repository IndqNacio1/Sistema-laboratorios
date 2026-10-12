import { mockUsers } from '../data/usersData.js';

export const usersEndpoints = {
  list: 'GET /usuarios',
  create: 'POST /usuarios',
  update: 'PATCH /usuarios/:id',
  updateStatus: 'PATCH /usuarios/:id/estado',
};

export const getUsers = () => mockUsers;

export const getUserPayload = (formValues) => ({
  nombre: formValues.nombre,
  correo: formValues.correo,
  rol: formValues.rol,
  sucursal: formValues.sucursal,
  estado: formValues.estado,
});
