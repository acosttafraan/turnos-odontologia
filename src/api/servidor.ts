import { consultarDisponibilidad } from '../agenda/disponibilidad.ts';
import type { Agenda } from '../agenda/puertos.ts';
import { registrarAgendaDiaria } from './agenda-diaria.ts';
import { registrarEstaticos } from './estaticos.ts';
import { ErrorHttp } from './errores.ts';
import { crearRouter } from './router.ts';
import { registrarTurnos } from './turnos.ts';
import { leerFecha } from './validar.ts';

export const HOST_LOCAL = '127.0.0.1';

export function crearServidor(agenda: Agenda) {
  const router = crearRouter();
  router.registrar('GET', '/api/v1/health', () => ({ estado: 200, cuerpo: { estado: 'ok' } }));
  router.registrar('GET', '/api/v1/disponibilidad', (_solicitud, url) => {
    const fecha = leerFecha(url);
    const prestacionId = url.searchParams.get('prestacionId');
    if (!prestacionId?.trim()) {
      throw new ErrorHttp(422, 'PRESTACION_REQUERIDA', 'Indicá la prestación que querés reservar.');
    }
    return { estado: 200, cuerpo: consultarDisponibilidad(agenda, fecha, prestacionId) };
  });
  registrarTurnos(router, agenda);
  registrarAgendaDiaria(router, agenda);
  registrarEstaticos(router);
  return router.servidor;
}
