import {
  duracionConfigurada, franjasDelDia, hayBloqueo, hayTurnoActivo, obtenerPrestacionActiva,
} from './disponibilidad.ts';
import { ReglaNegocioError } from './errores.ts';
import { fechaLocal, isoLocal } from './fecha.ts';
import { contiene } from './intervalo.ts';
import type { Agenda } from './puertos.ts';
import type { Turno } from './tipos.ts';

export type EntradaTurno = { pacienteId: string; prestacionId: string; inicio: number };

export function crearTurno(agenda: Agenda, entrada: EntradaTurno, generarId: () => string): Turno {
  const { pacienteId, prestacionId, inicio } = entrada;
  if (!agenda.pacientes.obtener(pacienteId)) {
    throw new ReglaNegocioError('RN-TU-07', 'El paciente no existe.');
  }
  const prestacion = obtenerPrestacionActiva(agenda, prestacionId);
  const ahora = agenda.reloj.ahora();

  if (inicio <= ahora) {
    throw new ReglaNegocioError('RN-TU-04', 'El inicio debe ser posterior al momento actual.');
  }

  const duracion = duracionConfigurada(prestacion);
  const intervalo = { inicio, fin: inicio + duracion };
  const franja = franjasDelDia(agenda, fechaLocal(inicio)).find(franja => contiene(franja, intervalo));
  if (!franja) {
    throw new ReglaNegocioError('RN-TU-02', 'El turno completo debe caber en una franja de atención.');
  }
  if ((inicio - franja.inicio) % duracion !== 0) {
    throw new ReglaNegocioError('RN-TU-02', 'Elegí uno de los horarios ofrecidos para la prestación.');
  }
  if (hayBloqueo(agenda, intervalo)) {
    throw new ReglaNegocioError('RN-TU-03', 'El horario está bloqueado. Elegí otro horario.');
  }

  const registradoEn = isoLocal(ahora);
  const turno: Turno = {
    id: generarId(), consultorioId: agenda.consultorioId, pacienteId, prestacionId,
    inicio: isoLocal(inicio), fin: isoLocal(intervalo.fin), duracionMinutos: prestacion.duracionMinutos,
    estado: 'RESERVADO', creadoEn: registradoEn, actualizadoEn: registradoEn,
  };

  // RN-TU-10: ambos pasos deben ejecutarse juntos en el mismo tramo síncrono.
  if (hayTurnoActivo(agenda, intervalo)) {
    throw new ReglaNegocioError('RN-TU-01', 'El horario ya está ocupado. Elegí otro horario.');
  }
  agenda.turnos.guardar(turno);
  return turno;
}
