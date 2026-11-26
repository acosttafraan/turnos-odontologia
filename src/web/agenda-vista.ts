const zona = 'America/Argentina/Buenos_Aires';
const calendario = new Intl.DateTimeFormat('en-CA', {
  timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit',
});
const hora = new Intl.DateTimeFormat('es-AR', {
  timeZone: zona, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
const titulo = new Intl.DateTimeFormat('es-AR', { dateStyle: 'full', timeZone: 'UTC' });

export type Intervalo = { inicio: string; fin: string };
export type Bloqueo = Intervalo & { motivo: string };
export type Turno = Intervalo & {
  paciente: { nombre: string; apellido: string } | null;
  prestacion: { nombre: string } | null;
  estado: string;
};

const estados: Record<string, string> = {
  RESERVADO: 'Reservado', CONFIRMADO: 'Confirmado', CANCELADO: 'Cancelado',
  ASISTIO: 'Asistió', AUSENTE: 'Ausente',
};

export function fechaConsultorio(instante: number): string {
  const partes = Object.fromEntries(calendario.formatToParts(instante)
    .map(({ type, value }) => [type, value]));
  return [partes.year, partes.month, partes.day].join('-');
}

export function moverFecha(fecha: string, dias: number): string {
  const dia = new Date(fecha + 'T00:00:00Z');
  dia.setUTCDate(dia.getUTCDate() + dias);
  return dia.toISOString().slice(0, 10);
}

export function tituloFecha(fecha: string): string {
  return titulo.format(Date.parse(fecha + 'T00:00:00Z'));
}

export function formatearIntervalo(intervalo: Intervalo, fecha?: string): string {
  const inicio = Date.parse(intervalo.inicio);
  const fin = Date.parse(intervalo.fin);
  const horaFin = fecha && fechaConsultorio(fin) !== fecha ? '24:00' : hora.format(fin);
  return hora.format(inicio) + ' – ' + horaFin;
}

export function prepararDia(franjas: Intervalo[], bloqueos: Bloqueo[], turnos: Turno[], fecha: string) {
  const porInicio = (a: Intervalo, b: Intervalo) => Date.parse(a.inicio) - Date.parse(b.inicio);
  return {
    franjas: franjas.toSorted(porInicio).map(franja => formatearIntervalo(franja, fecha)),
    bloqueos: bloqueos.toSorted(porInicio).map(bloqueo => ({
      horario: formatearIntervalo(bloqueo, fecha), motivo: bloqueo.motivo,
    })),
    filas: turnos.toSorted(porInicio).map(turno => ({
      horario: formatearIntervalo(turno, fecha),
      paciente: turno.paciente ? turno.paciente.nombre + ' ' + turno.paciente.apellido : 'Sin datos',
      prestacion: turno.prestacion?.nombre ?? 'Sin datos',
      estado: estados[turno.estado] ?? turno.estado,
    })),
    mensajeFranjas: franjas.length ? '' : 'Sin atención',
    mensajeTurnos: turnos.length ? '' : 'No hay turnos para este día.',
  };
}
