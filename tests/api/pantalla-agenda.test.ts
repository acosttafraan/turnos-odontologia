import assert from 'node:assert/strict';
import { test } from 'node:test';
import { datosPrueba, FECHA, hora, iniciarAgenda } from './agenda-prueba.ts';

test('C-17: sirve HTML, CSS y los módulos como JavaScript desde el servidor local', async t => {
  const { url } = await iniciarAgenda(t);
  const recursos = [
    ['/agenda.html', 'text/html'], ['/agenda.css', 'text/css'],
    ['/agenda.ts', 'text/javascript'], ['/agenda-vista.ts', 'text/javascript'],
  ];
  for (const [ruta, tipo] of recursos) {
    const respuesta = await fetch(url + ruta);
    assert.equal(respuesta.status, 200, ruta);
    assert.equal(respuesta.headers.get('content-type'), tipo + '; charset=utf-8');
    const cuerpo = await respuesta.text();
    if (ruta === '/agenda.html') {
      assert.match(cuerpo, /role="alert"/);
      assert.match(cuerpo, /<table\b/);
    }
    if (ruta === '/agenda-vista.ts') {
      const modulo = await import('data:text/javascript,' + encodeURIComponent(cuerpo));
      assert.equal(modulo.moverFecha(FECHA, 1), '2030-01-08');
    }
  }
  const noPublicado = await fetch(url + '/package.json');
  assert.equal(noPublicado.status, 404);
  assert.equal((await noPublicado.json()).codigo, 'RUTA_INEXISTENTE');
});

test('C-17 RN-AG-01/RN-CF-01: consulta franjas y recorta bloqueos al día local', async t => {
  const datos = datosPrueba();
  datos.bloqueos = [{
    id: 'cruza-medianoche', consultorioId: 'consultorio-demo', motivo: 'Bloqueo de ejemplo',
    inicio: hora('23:30', '2030-01-06'), fin: hora('00:30'),
  }];
  const { url } = await iniciarAgenda(t, datos);
  const ruta = url + '/api/v1/agenda-diaria?fecha=';
  const respuesta = await fetch(ruta + FECHA);
  assert.equal(respuesta.status, 200);
  assert.deepEqual(await respuesta.json(), {
    franjas: [{ inicio: hora('08:00'), fin: hora('16:00') }],
    bloqueos: [{ inicio: hora('00:00'), fin: hora('00:30'), motivo: 'Bloqueo de ejemplo' }],
  });
  assert.deepEqual(await (await fetch(ruta + '2030-01-12')).json(), { franjas: [], bloqueos: [] });
  const invalida = await fetch(ruta + '2030-02-30');
  assert.equal(invalida.status, 422);
  assert.equal((await invalida.json()).codigo, 'FECHA_INVALIDA');
});
