import {
  obtenerPrestacionActiva,
  duracionConfigurada,
  franjasDelDia,
  hayBloqueo,
} from './disponibilidad.ts';
import { ReglaNegocioError } from './errores.ts';
import { esActivo, transicionarEstado } from './estado.ts';
import { fechaLocal, isoLocal, MINUTO } from './fecha.ts';
import { contiene } from './intervalo.ts';
import type { Agenda } from './puertos.ts';
import type { Turno } from './tipos.ts';

export type EntradaReprogramacion = {
  inicio: number;
  duracionMinutos?: number;
};

export function reprogramarTurno(
  agenda: Agenda,
  id: string,
  entrada: EntradaReprogramacion,
  generarId: () => string,
): Turno {
  const original = agenda.turnos.obtener(id);

  if (!original) {
    throw new ReglaNegocioError(
      'TURNO_INEXISTENTE',
      'El turno no existe.',
    );
  }

  // RN-TU-08: solamente se pueden reprogramar turnos activos.
  if (!esActivo(original.estado)) {
    throw new ReglaNegocioError(
      'RN-TU-08',
      'Solo se pueden reprogramar turnos reservados o confirmados.',
    );
  }

  const ahora = agenda.reloj.ahora();
  const registradoEn = isoLocal(ahora);

  // RN-TU-09: el turno original no debe haber comenzado.
  if (Date.parse(original.inicio) <= ahora) {
    throw new ReglaNegocioError(
      'RN-TU-09',
      'No se puede reprogramar un turno que ya comenzó.',
    );
  }

  // RN-TU-07: el paciente debe existir.
  if (!agenda.pacientes.obtener(original.pacienteId)) {
    throw new ReglaNegocioError(
      'RN-TU-07',
      'El paciente no existe.',
    );
  }

  // RN-TU-07: la prestación debe existir y estar activa.
  const prestacion = obtenerPrestacionActiva(
    agenda, original.prestacionId,
  );

  // RN-TU-04: el nuevo inicio debe ser estrictamente futuro.
  if (entrada.inicio <= ahora) {
    throw new ReglaNegocioError(
      'RN-TU-04',
      'El inicio debe ser posterior al momento actual.',
    );
  }

  // RN-TU-05: validar la duración personalizada cuando se indica.
  if (entrada.duracionMinutos !== undefined) {
    const minutos = entrada.duracionMinutos;

    if (
      !Number.isInteger(minutos) ||
      minutos < 5 ||
      minutos > 480 ||
      minutos % 5 !== 0
    ) {
      throw new ReglaNegocioError(
        'RN-TU-05',
        'La duración debe ser un número entero entre 5 y 480 minutos y múltiplo de 5.',
      );
    }
  }

  // RN-TU-05: utilizar la duración indicada o la de la prestación.
  const duracion = entrada.duracionMinutos === undefined
    ? duracionConfigurada(prestacion)
    : entrada.duracionMinutos * MINUTO;

  // RN-TU-06: calcular el intervalo del nuevo turno.
  const intervalo = {
    inicio: entrada.inicio,
    fin: entrada.inicio + duracion,
  };

  // RN-TU-02: el turno completo debe caber en una sola franja.
  // La reprogramación permite inicios fuera de la grilla.
  const franja = franjasDelDia(
    agenda, fechaLocal(intervalo.inicio),
  ).find(franja => contiene(franja, intervalo));

  if (!franja) {
    throw new ReglaNegocioError(
      'RN-TU-02',
      'El turno completo debe caber en una franja de atención.',
    );
  }

  // RN-TU-03: el nuevo turno no debe superponerse con bloqueos.
  if (hayBloqueo(agenda, intervalo)) {
    throw new ReglaNegocioError(
      'RN-TU-03',
      'El horario está bloqueado. Elegí otro horario.',
    );
  }

  const originalCancelado = transicionarEstado(
    original, 'CANCELADO', {
      actualizadoEn: registradoEn,
      canceladoEn: registradoEn,
      tipo: 'EN_TERMINO',
    },
  );

  const nuevo: Turno = {
    id: generarId(),
    consultorioId: original.consultorioId,
    pacienteId: original.pacienteId,
    prestacionId: original.prestacionId,
    inicio: isoLocal(intervalo.inicio),
    fin: isoLocal(intervalo.fin),
    duracionMinutos: duracion / MINUTO,
    estado: 'RESERVADO',
    reprogramadoDesdeId: original.id,
    creadoEn: registradoEn,
    actualizadoEn: registradoEn,
  };

  // RN-TU-01: excluir el turno original del chequeo de solapamientos.
  // RN-TU-10: mantener el chequeo y las escrituras en un tramo síncrono.
  const haySolapamiento = agenda.turnos
    .listarActivosEntre(intervalo.inicio, intervalo.fin)
    .some(turno => turno.id !== original.id);

  if (haySolapamiento) {
    throw new ReglaNegocioError(
      'RN-TU-01',
      'El horario ya está ocupado. Elegí otro horario.',
    );
  }

  agenda.turnos.guardar(originalCancelado);
  agenda.turnos.guardar(nuevo);

  return nuevo;
}