import { DIA, diaSemana, fechaLocal, instanteLocal, isoLocal } from '../agenda/fecha.ts';
import { ZONA_HORARIA } from '../agenda/tipos.ts';
import type { DiaSemana } from '../agenda/tipos.ts';
import type { DatosAgenda } from './memoria.ts';

export function datosDemo(ahora: number): DatosAgenda {
  const consultorioId = 'consultorio-demo';
  const diasHabiles: DiaSemana[] = [1, 2, 3, 4, 5];
  const hoy = Date.parse(fechaLocal(ahora) + 'T12:00:00Z');
  let diaBloqueado = fechaLocal(hoy + DIA);
  for (let dia = 2; !diasHabiles.includes(diaSemana(diaBloqueado)); dia++) {
    diaBloqueado = fechaLocal(hoy + dia * DIA);
  }
  const creadoEn = isoLocal(ahora);

  return {
    consultorio: {
      id: consultorioId, usuarioId: 'odontologo-demo', nombre: 'Consultorio Demo',
      direccion: 'Calle Ficticia 123', telefono: '5491100000000',
      anticipacionCancelacionHoras: 24, zonaHoraria: ZONA_HORARIA,
    },
    horarios: diasHabiles.map(diaSemana => ({
      id: 'franja-' + diaSemana, consultorioId, diaSemana, horaInicio: '08:00', horaFin: '16:00',
    })),
    prestaciones: [{
      id: 'consulta-general', consultorioId, nombre: 'Consulta general', duracionMinutos: 20, activa: true,
    }],
    pacientes: [1, 2, 3].map(numero => ({
      id: 'paciente-demo-' + numero, consultorioId, nombre: 'Paciente ' + numero, apellido: 'Demo',
      dni: '0000000' + numero, telefono: '549110000000' + numero, creadoEn,
    })),
    bloqueos: [{
      id: 'bloqueo-demo', consultorioId, motivo: 'Bloqueo de ejemplo',
      inicio: isoLocal(instanteLocal(diaBloqueado, '13:00')),
      fin: isoLocal(instanteLocal(diaBloqueado, '13:20')),
    }],
  };
}
