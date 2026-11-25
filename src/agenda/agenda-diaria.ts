import type { Agenda } from './puertos.ts';

export function listarAgendaDiaria(agenda: Agenda, fecha: string) {
  return agenda.turnos.listarPorFecha(fecha)
    .sort((a, b) => Date.parse(a.inicio) - Date.parse(b.inicio))
    .map(turno => {
      const paciente = agenda.pacientes.obtener(turno.pacienteId);
      const prestacion = agenda.prestaciones.obtener(turno.prestacionId);
      return {
        ...turno,
        paciente: paciente ? { id: paciente.id, nombre: paciente.nombre, apellido: paciente.apellido } : null,
        prestacion: prestacion ? { id: prestacion.id, nombre: prestacion.nombre } : null,
      };
    });
}
