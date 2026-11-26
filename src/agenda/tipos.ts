export const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';

export type DiaSemana = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type EstadoTurno = 'RESERVADO' | 'CONFIRMADO' | 'CANCELADO' | 'ASISTIO' | 'AUSENTE';
export type TipoCancelacion = 'EN_TERMINO' | 'TARDIA';

export type Consultorio = {
  id: string;
  usuarioId: string;
  nombre: string;
  direccion: string;
  telefono: string;
  anticipacionCancelacionHoras: number;
  zonaHoraria: typeof ZONA_HORARIA;
};

export type FranjaHorario = {
  id: string;
  consultorioId: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
};

export type Bloqueo = {
  id: string;
  consultorioId: string;
  inicio: string;
  fin: string;
  motivo: string;
};

export type Prestacion = {
  id: string;
  consultorioId: string;
  nombre: string;
  duracionMinutos: number;
  activa: boolean;
};

export type Paciente = {
  id: string;
  consultorioId: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email?: string;
  obraSocial?: string;
  creadoEn: string;
};

export type Turno = {
  id: string;
  consultorioId: string;
  pacienteId: string;
  prestacionId: string;
  inicio: string;
  fin: string;
  duracionMinutos: number;
  estado: EstadoTurno;
  tipoCancelacion?: TipoCancelacion;
  canceladoEn?: string;
  reprogramadoDesdeId?: string;
  creadoEn: string;
  actualizadoEn: string;
};
