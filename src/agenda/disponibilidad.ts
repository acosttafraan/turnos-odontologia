import { ReglaNegocioError } from './errores.ts';
import { diaSemana, instanteLocal, isoLocal, MINUTO } from './fecha.ts';
import { contiene } from './intervalo.ts';
import type { Intervalo } from './intervalo.ts';
import type { Agenda } from './puertos.ts';
import type { Prestacion } from './tipos.ts';

export function obtenerPrestacionActiva(agenda: Agenda, id: string): Prestacion {
  const prestacion = agenda.prestaciones.obtener(id);
  if (!prestacion?.activa) {
    throw new ReglaNegocioError('RN-TU-07', 'La prestación no existe o está inactiva.');
  }
  return prestacion;
}

export function duracionConfigurada(prestacion: Prestacion): number {
  const minutos = prestacion.duracionMinutos;
  if (!Number.isInteger(minutos) || minutos < 5 || minutos > 480 || minutos % 5 !== 0) {
    throw new ReglaNegocioError('RN-TU-05', 'La prestación tiene una duración inválida.');
  }
  return minutos * MINUTO;
}

export function franjasDelDia(agenda: Agenda, fecha: string): Intervalo[] {
  return agenda.horarios.listarPorDia(diaSemana(fecha)).map(franja => ({
    inicio: instanteLocal(fecha, franja.horaInicio),
    fin: instanteLocal(fecha, franja.horaFin),
  })).sort((a, b) => a.inicio - b.inicio);
}

export function hayBloqueo(agenda: Agenda, intervalo: Intervalo): boolean {
  return agenda.bloqueos.listarEntre(intervalo).length > 0;
}

export function hayTurnoActivo(agenda: Agenda, intervalo: Intervalo): boolean {
  return agenda.turnos.listarActivosEntre(intervalo.inicio, intervalo.fin).length > 0;
}

export function consultarDisponibilidad(agenda: Agenda, fecha: string, prestacionId: string) {
  const duracion = duracionConfigurada(obtenerPrestacionActiva(agenda, prestacionId));
  const ahora = agenda.reloj.ahora();
  const horarios: { inicio: string; fin: string }[] = [];

  for (const franja of franjasDelDia(agenda, fecha)) {
    for (let inicio = franja.inicio; ; inicio += duracion) {
      const intervalo = { inicio, fin: inicio + duracion };
      if (!contiene(franja, intervalo)) break;
      if (inicio > ahora && !hayBloqueo(agenda, intervalo) && !hayTurnoActivo(agenda, intervalo)) {
        horarios.push({ inicio: isoLocal(inicio), fin: isoLocal(intervalo.fin) });
      }
    }
  }
  return horarios;
}
