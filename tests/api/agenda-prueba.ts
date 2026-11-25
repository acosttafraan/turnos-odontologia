import type { TestContext } from 'node:test';
import { crearServidor } from '../../src/api/servidor.ts';
import type { EstadoTurno, Turno } from '../../src/agenda/tipos.ts';
import { crearAgendaEnMemoria } from '../../src/infra/memoria.ts';
import type { DatosAgenda } from '../../src/infra/memoria.ts';
import { datosDemo } from '../../src/infra/semilla.ts';
import { escuchar } from './servidor-prueba.ts';

export const FECHA = '2030-01-07';
export const AHORA = '2030-01-06T00:00:00-03:00';
export const PRESTACION = 'consulta-general';
export const PACIENTE = 'paciente-demo-1';

export function hora(hhmm: string, fecha = FECHA): string {
  return fecha + 'T' + hhmm + ':00-03:00';
}

export function turnoDemo(id: string, inicio: string, fin: string, estado: EstadoTurno): Turno {
  return {
    id, inicio, fin, estado, consultorioId: 'consultorio-demo', pacienteId: PACIENTE,
    prestacionId: PRESTACION, duracionMinutos: (Date.parse(fin) - Date.parse(inicio)) / 60_000,
    creadoEn: AHORA, actualizadoEn: AHORA,
  };
}

export function datosPrueba(ahora = AHORA): DatosAgenda {
  return { ...datosDemo(Date.parse(ahora)), bloqueos: [] };
}

export async function iniciarAgenda(t: TestContext, datos = datosPrueba(), ahora = AHORA) {
  const agenda = crearAgendaEnMemoria(datos, { ahora: () => Date.parse(ahora) });
  const { url, direccion } = await escuchar(t, crearServidor(agenda));
  return {
    agenda,
    direccion,
    url,
    disponibilidad: (fecha = FECHA, prestacionId = PRESTACION) =>
      fetch(url + '/api/v1/disponibilidad?' + new URLSearchParams({ fecha, prestacionId })),
    reservar: (inicio: string, campos: Record<string, unknown> = {}) =>
      fetch(url + '/api/v1/turnos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacienteId: PACIENTE, prestacionId: PRESTACION, inicio, ...campos }),
      }),
    agendaDiaria: (fecha = FECHA) =>
      fetch(url + '/api/v1/turnos?' + new URLSearchParams({ fecha })),
  };
}
