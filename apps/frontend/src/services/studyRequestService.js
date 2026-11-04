import { getPatients } from './patientsService.js';
import { getServices } from './servicesService.js';

export async function getStudyOptions(options) {
  const [patients, services] = await Promise.all([getPatients(options), getServices(options)]);
  return {
    patients: patients.filter((patient) => patient.estatus === 'activo'),
    services: services.filter((service) => service.estatus === 'activo'),
  };
}

export const hasValidStudyPrice = (price) => /^\d{1,10}(\.\d{1,2})?$/.test(String(price));

export function prepareStudyRequest(patient, service) {
  if (!patient?.id || patient.estatus !== 'activo') throw new Error('Selecciona un paciente activo.');
  if (!service?.id || service.estatus !== 'activo') throw new Error('Selecciona un servicio activo.');
  if (!hasValidStudyPrice(service.precio)) throw new Error('El servicio no tiene un costo valido.');
  return { pacienteId: patient.id, servicioId: service.id };
}
