import type { Reloj } from './reloj.ts';
import type { Intervalo } from './intervalo.ts';
import type { Bloqueo, DiaSemana, FranjaHorario, Paciente, Prestacion, Turno } from './tipos.ts';

// Los puertos de agenda son síncronos para mantener atómico el chequeo y guardado.
export interface TurnosRepo {
  listarActivosEntre(desde: number, hasta: number): Turno[];
  listarPorFecha(fecha: string): Turno[];
  guardar(turno: Turno): void;
  obtener(id: string): Turno | undefined;
}

export interface HorariosRepo {
  listarPorDia(dia: DiaSemana): FranjaHorario[];
}

export interface BloqueosRepo {
  listarEntre(intervalo: Intervalo): Bloqueo[];
}

export interface PrestacionesRepo {
  obtener(id: string): Prestacion | undefined;
}

export interface PacientesRepo {
  obtener(id: string): Paciente | undefined;
}

export type Agenda = {
  consultorioId: string;
  // RN-CF-02: horas mínimas de anticipación para que una cancelación sea en término.
  anticipacionCancelacionHoras: number;
  turnos: TurnosRepo;
  horarios: HorariosRepo;
  bloqueos: BloqueosRepo;
  prestaciones: PrestacionesRepo;
  pacientes: PacientesRepo;
  reloj: Reloj;
};
