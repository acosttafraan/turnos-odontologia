import { fechaConsultorio, moverFecha, prepararDia, tituloFecha } from './agenda-vista.ts';
import type { Bloqueo, Intervalo, Turno } from './agenda-vista.ts';

const fechaVisible = document.querySelector<HTMLTimeElement>('#fecha')!;
const contenido = document.querySelector<HTMLElement>('#jornada')!;
const franjas = document.querySelector<HTMLUListElement>('#franjas')!;
const bloqueos = document.querySelector<HTMLUListElement>('#bloqueos')!;
const seccionBloqueos = document.querySelector<HTMLElement>('#seccion-bloqueos')!;
const filas = document.querySelector<HTMLTableSectionElement>('#filas')!;
const tabla = document.querySelector<HTMLTableElement>('#turnos')!;
const sinAtencion = document.querySelector<HTMLParagraphElement>('#sin-atencion')!;
const sinTurnos = document.querySelector<HTMLParagraphElement>('#sin-turnos')!;
const estado = document.querySelector<HTMLParagraphElement>('#estado')!;
const alerta = document.querySelector<HTMLParagraphElement>('#error')!;

let fecha = fechaConsultorio(Date.now());
let solicitud: AbortController | undefined;

class ErrorConsulta extends Error {}

async function consultar(url: string, signal: AbortSignal): Promise<unknown> {
  const respuesta = await fetch(url, { signal });
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => null);
    if (typeof datos?.mensaje === 'string') {
      const codigo = typeof datos.codigo === 'string' ? datos.codigo + ' · ' : '';
      throw new ErrorConsulta(codigo + datos.mensaje);
    }
    throw new ErrorConsulta('La consulta falló (HTTP ' + respuesta.status + ').');
  }
  return respuesta.json();
}

function elemento<K extends keyof HTMLElementTagNameMap>(tipo: K, texto: string) {
  const nodo = document.createElement(tipo);
  nodo.textContent = texto;
  return nodo;
}

async function cargar(dia: string) {
  solicitud?.abort();
  const actual = new AbortController();
  solicitud = actual;
  fecha = dia;
  fechaVisible.dateTime = dia;
  fechaVisible.textContent = tituloFecha(dia);
  contenido.hidden = true;
  alerta.textContent = '';
  estado.textContent = 'Cargando agenda…';
  const consulta = '?' + new URLSearchParams({ fecha: dia });

  try {
    const [datos, turnos] = await Promise.all([
      consultar('/api/v1/agenda-diaria' + consulta, actual.signal) as Promise<{
        franjas: Intervalo[]; bloqueos: Bloqueo[];
      }>,
      consultar('/api/v1/turnos' + consulta, actual.signal) as Promise<Turno[]>,
    ]);
    if (solicitud !== actual) return;
    const vista = prepararDia(datos.franjas, datos.bloqueos, turnos, dia);
    franjas.replaceChildren(...vista.franjas.map(horario => elemento('li', horario)));
    bloqueos.replaceChildren(...vista.bloqueos.map(bloqueo =>
      elemento('li', bloqueo.horario + ' · ' + (bloqueo.motivo || 'Bloqueo'))));
    seccionBloqueos.hidden = vista.bloqueos.length === 0;
    filas.replaceChildren(...vista.filas.map(fila => {
      const tr = document.createElement('tr');
      tr.append(...[fila.horario, fila.paciente, fila.prestacion, fila.estado]
        .map(texto => elemento('td', texto)));
      return tr;
    }));
    tabla.hidden = vista.filas.length === 0;
    sinAtencion.textContent = vista.mensajeFranjas;
    sinTurnos.textContent = vista.mensajeTurnos;
    contenido.hidden = false;
  } catch (error) {
    if (solicitud !== actual) return;
    alerta.textContent = error instanceof ErrorConsulta ? error.message : 'No se pudo cargar la agenda.';
  } finally {
    if (solicitud === actual) estado.textContent = '';
  }
}

document.querySelector('#anterior')!.addEventListener('click', () => void cargar(moverFecha(fecha, -1)));
document.querySelector('#siguiente')!.addEventListener('click', () => void cargar(moverFecha(fecha, 1)));
document.querySelector('#hoy')!.addEventListener('click', () => void cargar(fechaConsultorio(Date.now())));
void cargar(fecha);
