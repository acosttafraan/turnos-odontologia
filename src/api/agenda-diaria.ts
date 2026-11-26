import { franjasDelDia } from '../agenda/disponibilidad.ts';
import { DIA, instanteLocal, isoLocal } from '../agenda/fecha.ts';
import type { Agenda } from '../agenda/puertos.ts';
import type { crearRouter } from './router.ts';
import { leerFecha } from './validar.ts';

export function registrarAgendaDiaria(router: ReturnType<typeof crearRouter>, agenda: Agenda) {
  router.registrar('GET', '/api/v1/agenda-diaria', (_solicitud, url) => {
    const fecha = leerFecha(url);
    const siguiente = new Date(Date.parse(fecha + 'T00:00:00Z') + DIA).toISOString().split('T')[0];
    const inicio = instanteLocal(fecha, '00:00');
    const fin = instanteLocal(siguiente, '00:00');
    const franjas = franjasDelDia(agenda, fecha).map(franja => ({
      inicio: isoLocal(franja.inicio), fin: isoLocal(franja.fin),
    }));
    const bloqueos = agenda.bloqueos.listarEntre({ inicio, fin }).map(bloqueo => ({
      inicio: isoLocal(Math.max(inicio, Date.parse(bloqueo.inicio))),
      fin: isoLocal(Math.min(fin, Date.parse(bloqueo.fin))),
      motivo: bloqueo.motivo,
    }));
    return { estado: 200, cuerpo: { franjas, bloqueos } };
  });
}
