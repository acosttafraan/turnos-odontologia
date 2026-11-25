import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crearRouter } from '../../src/api/router.ts';
import { escuchar } from './servidor-prueba.ts';

test('C10 D8: una ruta con :id recibe el valor del segmento', async t => {
  const router = crearRouter();
  router.registrar('POST', '/api/v1/turnos/:id/cancelar', (_solicitud, _url, params) => ({
    estado: 200, cuerpo: { id: params.id },
  }));
  const { url } = await escuchar(t, router.servidor);
  const respuesta = await fetch(url + '/api/v1/turnos/turno-123/cancelar', { method: 'POST' });
  assert.equal(respuesta.status, 200);
  assert.deepEqual(await respuesta.json(), { id: 'turno-123' });
});

test('C10 D8: el valor del parámetro llega decodificado', async t => {
  const router = crearRouter();
  router.registrar('GET', '/api/v1/turnos/:id', (_solicitud, _url, params) => ({
    estado: 200, cuerpo: { id: params.id },
  }));
  const { url } = await escuchar(t, router.servidor);
  const respuesta = await fetch(url + '/api/v1/turnos/turno%20demo');
  assert.deepEqual(await respuesta.json(), { id: 'turno demo' });
});

test('C10 D8: las rutas exactas tienen prioridad sobre las rutas con parámetros', async t => {
  const router = crearRouter();
  router.registrar('GET', '/api/v1/turnos/:id', () => ({ estado: 200, cuerpo: { ruta: 'parametro' } }));
  router.registrar('GET', '/api/v1/turnos/hoy', () => ({ estado: 200, cuerpo: { ruta: 'exacta' } }));
  const { url } = await escuchar(t, router.servidor);
  assert.deepEqual(await (await fetch(url + '/api/v1/turnos/hoy')).json(), { ruta: 'exacta' });
  assert.deepEqual(await (await fetch(url + '/api/v1/turnos/otro')).json(), { ruta: 'parametro' });
});

test('C10 D8: método distinto, segmentos de más o segmento vacío siguen respondiendo 404', async t => {
  const router = crearRouter();
  router.registrar('POST', '/api/v1/turnos/:id/cancelar', () => ({ estado: 200, cuerpo: {} }));
  const { url } = await escuchar(t, router.servidor);
  for (const [metodo, ruta] of [
    ['GET', '/api/v1/turnos/turno-1/cancelar'],
    ['POST', '/api/v1/turnos/turno-1/cancelar/extra'],
    ['POST', '/api/v1/turnos//cancelar'],
  ]) {
    const respuesta = await fetch(url + ruta, { method: metodo });
    assert.equal(respuesta.status, 404, metodo + ' ' + ruta);
    assert.equal((await respuesta.json()).codigo, 'RUTA_INEXISTENTE');
  }
});
