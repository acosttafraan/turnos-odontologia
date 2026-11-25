import { esActivo } from '../agenda/estado.ts';
import { fechaLocal } from '../agenda/fecha.ts';
import { intervaloDe, seSuperponen } from '../agenda/intervalo.ts';
import type { Agenda } from '../agenda/puertos.ts';
import type { Reloj } from '../agenda/reloj.ts';
import type { Bloqueo, Consultorio, FranjaHorario, Paciente, Prestacion, Turno } from '../agenda/tipos.ts';

export type DatosAgenda = {
  consultorio: Consultorio;
  horarios: FranjaHorario[];
  bloqueos: Bloqueo[];
  prestaciones: Prestacion[];
  pacientes: Paciente[];
  turnos?: Turno[];
};

export function crearAgendaEnMemoria(datos: DatosAgenda, reloj: Reloj): Agenda {
  const porId = <T extends { id: string }>(elementos: T[]) =>
    new Map(elementos.map(elemento => [elemento.id, elemento]));

  const turnos = porId(datos.turnos ?? []);
  const horarios = porId(datos.horarios);
  const bloqueos = porId(datos.bloqueos);
  const prestaciones = porId(datos.prestaciones);
  const pacientes = porId(datos.pacientes);

  return {
    consultorioId: datos.consultorio.id,
    reloj,
    turnos: {
      listarActivosEntre(desde, hasta) {
        const rango = { inicio: desde, fin: hasta };
        return [...turnos.values()].filter(turno =>
          esActivo(turno.estado) && seSuperponen(intervaloDe(turno), rango));
      },
      listarPorFecha(fecha) {
        return [...turnos.values()].filter(turno => fechaLocal(Date.parse(turno.inicio)) === fecha);
      },
      guardar(turno) { turnos.set(turno.id, turno); },
      obtener(id) { return turnos.get(id); },
    },
    horarios: {
      listarPorDia(dia) { return [...horarios.values()].filter(franja => franja.diaSemana === dia); },
    },
    bloqueos: {
      listarEntre(intervalo) {
        return [...bloqueos.values()].filter(bloqueo => seSuperponen(intervaloDe(bloqueo), intervalo));
      },
    },
    prestaciones: { obtener: id => prestaciones.get(id) },
    pacientes: { obtener: id => pacientes.get(id) },
  };
}
