
import { randomUUID } from 'node:crypto';
import { listarAgendaDiaria } from '../agenda/agenda-diaria.ts';
import { cancelarTurno } from '../agenda/cancelar-turno.ts';
import { crearTurno } from '../agenda/crear-turno.ts';
import type { EntradaTurno } from '../agenda/crear-turno.ts';
import { reprogramarTurno } from '../agenda/reprogramar-turno.ts';
import type { EntradaReprogramacion } from '../agenda/reprogramar-turno.ts';
import { ReglaNegocioError } from '../agenda/errores.ts';
import { parsearInicio } from '../agenda/fecha.ts';
import type { Agenda } from '../agenda/puertos.ts';
import { ErrorHttp } from './errores.ts';
import { leerJson } from './router.ts';
import type { crearRouter } from './router.ts';
import { leerFecha } from './validar.ts';

function validarEntrada(cuerpo: unknown): EntradaTurno {
  if (typeof cuerpo !== 'object' || cuerpo === null || Array.isArray(cuerpo)) {
    throw new ErrorHttp(422, 'ENTRADA_INVALIDA', 'Enviá los datos del turno en un objeto JSON.');
  }
  if (Object.hasOwn(cuerpo, 'duracionMinutos')) {
    throw new ReglaNegocioError('RN-TU-05', 'La duración la establece la prestación.');
  }
  if (Object.hasOwn(cuerpo, 'fin')) {
    throw new ReglaNegocioError('RN-TU-06', 'El servidor calcula el fin del turno.');
  }

  const { pacienteId, prestacionId, inicio } = cuerpo as Record<string, unknown>;
  const instante = parsearInicio(inicio);
  if (typeof pacienteId !== 'string' || !pacienteId.trim() ||
    typeof prestacionId !== 'string' || !prestacionId.trim() || instante === undefined) {
    throw new ErrorHttp(422, 'ENTRADA_INVALIDA', 'Indicá paciente, prestación e inicio ISO 8601 con offset.');
  }
  return { pacienteId, prestacionId, inicio: instante };
}

// C-11: validar los datos recibidos para reprogramar un turno.
function validarEntradaReprogramacion(cuerpo: unknown): EntradaReprogramacion {
  if (typeof cuerpo !== 'object' || cuerpo === null || Array.isArray(cuerpo)) {
    throw new ErrorHttp(
      422,
      'ENTRADA_INVALIDA',
      'Enviá los datos de reprogramación en un objeto JSON.',
    );
  }

  if (Object.hasOwn(cuerpo, 'fin')) {
    throw new ReglaNegocioError(
      'RN-TU-06',
      'El servidor calcula el fin del turno.',
    );
  }

  const { inicio, duracionMinutos } = cuerpo as Record<string, unknown>;
  const instante = parsearInicio(inicio);

  if (instante === undefined) {
    throw new ErrorHttp(
      422,
      'ENTRADA_INVALIDA',
      'Indicá un inicio ISO 8601 con offset.',
    );
  }

  if (Object.hasOwn(cuerpo, 'duracionMinutos')) {
    if (typeof duracionMinutos !== 'number') {
      throw new ReglaNegocioError(
        'RN-TU-05',
        'La duración debe ser un número entero entre 5 y 480 minutos y múltiplo de 5.',
      );
    }

    return {
      inicio: instante,
      duracionMinutos,
    };
  }

  return { inicio: instante };
}

export function registrarTurnos(router: ReturnType<typeof crearRouter>, agenda: Agenda) {
  router.registrar('GET', '/api/v1/turnos', (_solicitud, url) => ({
    estado: 200,
    cuerpo: listarAgendaDiaria(agenda, leerFecha(url)),
  }));

  router.registrar('POST', '/api/v1/turnos', async solicitud => {
    const entrada = validarEntrada(await leerJson(solicitud));
    return { estado: 201, cuerpo: crearTurno(agenda, entrada, randomUUID) };
  });

  // cancelar-turno-y-liberar-horario (C-10): RN-CA-01 a RN-CA-04.
  router.registrar('POST', '/api/v1/turnos/:id/cancelar', (_solicitud, _url, params) => {
    const cancelado = cancelarTurno(agenda, params.id);
    if (!cancelado) {
      throw new ErrorHttp(404, 'TURNO_INEXISTENTE', 'No existe un turno con ese identificador.');
    }
    return { estado: 200, cuerpo: cancelado };
  });

  // reprogramar-turno (C-11): RN-TU-01 a RN-TU-10.
  router.registrar(
    'PUT',
    '/api/v1/turnos/:id/reprogramar',
    async (solicitud, _url, params) => {
      const entrada = validarEntradaReprogramacion(
        await leerJson(solicitud),
      );

      try {
        const nuevo = reprogramarTurno(
          agenda,
          params.id,
          entrada,
          randomUUID,
        );

        return {
          estado: 200,
          cuerpo: nuevo,
        };
      } catch (error) {
        if (
          error instanceof ReglaNegocioError &&
          error.codigo === 'TURNO_INEXISTENTE'
        ) {
          throw new ErrorHttp(
            404,
            'TURNO_INEXISTENTE',
            'No existe un turno con ese identificador.',
          );
        }

        throw error;
      }
    },
  );
}
