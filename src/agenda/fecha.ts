import { ZONA_HORARIA } from './tipos.ts';
import type { DiaSemana } from './tipos.ts';

export const MINUTO = 60_000;
export const DIA = 24 * 60 * MINUTO;

const formatoLocal = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_HORARIA,
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3,
  hourCycle: 'h23', timeZoneName: 'longOffset',
});
const formatoDia = new Intl.DateTimeFormat('en', { timeZone: 'UTC', weekday: 'short' });
const diasSemana: Record<string, DiaSemana> = {
  Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7,
};

function partesLocales(instante: number): Record<string, string> {
  return Object.fromEntries(formatoLocal.formatToParts(instante).map(({ type, value }) => [type, value]));
}

function fechaDe(partes: Record<string, string>): string {
  return partes.year.padStart(4, '0') + '-' + partes.month + '-' + partes.day;
}

export function fechaLocal(instante: number): string {
  return fechaDe(partesLocales(instante));
}

export function esFechaValida(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const bisiesto = anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0);
  const diasPorMes = [31, bisiesto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return anio > 0 && mes >= 1 && mes <= 12 && dia >= 1 && dia <= diasPorMes[mes - 1];
}

export function parsearInicio(valor: unknown): number | undefined {
  if (typeof valor !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(valor) ||
    !esFechaValida(valor.slice(0, 10))) return undefined;
  const instante = Date.parse(valor);
  return Number.isFinite(instante) ? instante : undefined;
}

export function diaSemana(fecha: string): DiaSemana {
  return diasSemana[formatoDia.format(Date.parse(fecha + 'T12:00:00Z'))];
}

function desfase(instante: number): number {
  const zona = partesLocales(instante).timeZoneName;
  if (zona === 'GMT') return 0;
  const [horas, minutos, segundos = 0] = zona.slice(4).split(':').map(Number);
  const signo = zona[3] === '-' ? -1 : 1;
  return signo * (horas * 60 * MINUTO + minutos * MINUTO + segundos * 1_000);
}

export function instanteLocal(fecha: string, hora: string): number {
  const utc = Date.parse(fecha + 'T' + hora + ':00Z');
  const primeraConversion = utc - desfase(utc);
  return utc - desfase(primeraConversion);
}

export function isoLocal(instante: number): string {
  const partes = partesLocales(instante);
  const fraccion = partes.fractionalSecond === '000' ? '' : '.' + partes.fractionalSecond;
  const zona = partes.timeZoneName === 'GMT' ? '+00:00' : partes.timeZoneName.slice(3);
  return fechaDe(partes) + 'T' + partes.hour + ':' + partes.minute + ':' + partes.second + fraccion + zona;
}
