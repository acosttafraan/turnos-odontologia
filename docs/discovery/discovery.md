# Discovery: turnos-odontologia (checklist de 11 puntos)

**Fecha**: 2026-11-24
**Fuentes investigadas**: 16 sistemas, con la evidencia en [`sources/relevamiento-fuentes.md`](sources/relevamiento-fuentes.md). El análisis completo (secciones A-D) está en [`informe-discovery.md`](informe-discovery.md).
**Estado**: el usuario confirmó el resumen (gate de discovery-research). Se realizó la verificación manual de seis fuentes: tres confirmadas, dos parcialmente verificadas y una no accesible. Los resultados se registraron en informe-discovery.md.

## 1. Problema que resuelve

El odontólogo que atiende solo maneja su agenda con WhatsApp manual, papel o planillas. Eso genera turnos superpuestos, ausencias sin aviso y tiempo perdido confirmando a mano. Las soluciones existentes no le sirven bien:

- **Pensadas para clínicas:** Dentalink, Clinicorp y Simples Dental.
- **Médicas generalistas, sin odontología:** DrApp y MedicAI.
- **Con WhatsApp como costo extra:** DrApp y DentalSoft. En MedicAI no se pudo verificar el costo adicional de WhatsApp.

## 2. Usuarios / roles

- **Odontólogo independiente** (único usuario del MVP): configura su consultorio, gestiona turnos y pacientes y envía recordatorios.
- **Paciente**: recibe el recordatorio por WhatsApp. En el MVP no tiene acceso al sistema.

## 3. Casos de uso

1. Como odontólogo, quiero crear un turno sin que se superponga con otro mío, para no tener dobles reservas.
2. Como odontólogo, quiero cancelar o reprogramar un turno y que el horario quede libre, para poder reasignarlo.
3. Como odontólogo, quiero ver mi agenda del día y de la semana, para organizar mi jornada.
4. Como odontólogo, quiero enviar el recordatorio por WhatsApp con un clic sin pagar por mensaje, para reducir ausencias.
5. Como odontólogo, quiero marcar si el paciente asistió o faltó, para tener registro de las ausencias.

## 4. Competidores / soluciones existentes

| Competidor | Problema que resuelve | Pricing | Diferenciadores |
|---|---|---|---|
| DentalSoft (AR) | Agenda, historia clínica y obras sociales para odontología | Gestión $30.000 / Pro $60.000 por profesional y mes (moneda no indicada) | Obras sociales + Mercado Pago + WhatsApp; solapamientos declarados (Comercial) |
| AgendaPro (AR/LatAm) | Turnos, fichas, pagos e IA en WhatsApp | Individual $9.900 / Básico $19.900 / Premium $39.900 / Pro IA $129.900 por mes (ARS, IVA incluido) | Agenda por sillón, IA conversacional |
| DrApp (AR) | Gestión de consultorio médico con ARCA y Mercado Pago | $33.999 a $45.999 por agenda y mes + IVA | Marketplace Crontu, recetas electrónicas |
| MedicAI (AR) | Consultorio médico con ARCA y cumplimiento normativo | $25.900 + IVA por profesional y mes | Leyes 25.326, 26.529 y ReNaPDiS declaradas |
| Doctocliq (LatAm) | Gestión dental con IA en WhatsApp | USD 0 / 19 / 29 / 49 por mes | Plan gratis, odontograma y periodontograma Comprobados |
| Simples Dental (BR) | Agenda dental con sillones y lista de espera | Desde R$ 112 por mes | Referente de UX en agenda |

**Notas**:
- El análisis completo de los 16 sistemas y la puntuación están en el informe.
- Doctoralia tampoco fue accesible durante la verificación manual (ERR_TUNNEL_CONNECTION_FAILED). XIAgenda y Curve Dental continúan pendientes de verificación manual. Los tres se mantienen como No evidenciado.

## 5. Funcionalidades necesarias

- Horario de atención configurable y anticipación mínima de cancelación (24 h por defecto, configurable).
- Prestaciones con duración por defecto.
- Alta básica de pacientes.
- Crear turno sin solapamientos del profesional.
- Reprogramar y cancelar liberando el horario.
- Bloqueos de agenda (feriados, vacaciones).
- Vista de agenda diaria y semanal.
- Registro de asistencia y ausencia.
- Recordatorio por WhatsApp con enlace `wa.me` y mensaje prearmado.

## 6. Funcionalidades opcionales

Se dejan para etapas posteriores:

- Turnero online del paciente.
- WhatsApp Business API automático.
- Señas con Mercado Pago.
- Facturación ARCA.
- Obras sociales y liquidaciones.
- Odontograma, periodontograma e historia clínica.
- Varios profesionales y sillones.
- Lista de espera y sobreturnos.
- Reportes.

## 7. Reglas de negocio

- Un profesional no puede tener dos turnos superpuestos. Los intervalos son semiabiertos [inicio, fin): un turno que empieza exactamente cuando termina otro **es válido**.
- Un turno debe quedar completamente dentro del horario de atención del día y fuera de los bloqueos de agenda.
- La duración del turno es la de la prestación por defecto y puede editarse al crearlo.
- No se pueden crear turnos con inicio en el pasado.
- Cancelar con una anticipación igual o mayor a la mínima configurada (24 h por defecto) es una cancelación en término. Con menos anticipación es una cancelación tardía.
- Un turno cancelado libera su horario para otro turno.
- El mensaje de recordatorio no incluye datos clínicos: solo nombre, fecha, hora y dirección del consultorio.
- Ningún ejemplo, test ni captura usa datos reales de pacientes.

## 8. Integraciones

- Ninguna integración externa real en el MVP.
- WhatsApp se resuelve con enlaces `wa.me` (*click-to-chat*): no usa API ni cuenta de Meta y no tiene costo por mensaje.
- Mercado Pago, ARCA y WhatsApp Business API quedan para etapas posteriores.

## 9. Restricciones

- Es un trabajo práctico universitario, realizado por un equipo de cuatro integrantes con un plazo de entrega acotado (fecha TBD).
- No se usan datos reales de pacientes.
- Hay que respetar la Ley 25.326 (protección de datos personales) y la Ley 26.529 (derechos del paciente) en el diseño.
- El stack tecnológico no está definido: se decide en la Knowledge Base.

## 10. Riesgos

- **Costo de WhatsApp**: `wa.me` evita el costo por mensaje, pero el envío deja de ser automático, así que el diferencial es más débil frente a los competidores que usan la API.
- **Alcance del TP**: no llegar a terminar el change con tests. Por eso el MVP no tiene integraciones ni turnero del paciente.
- **Supuesto sin probar**: que el odontólogo independiente prefiera "sin costo por mensaje" antes que "envío automático". No está validado con usuarios.
- **Supuesto sin probar**: que el independiente necesite software. Según la tesis UdeSA, solo ~3 % de los odontólogos usa herramientas tecnológicas, lo que es una oportunidad pero también una barrera de adopción.
- **Evidencia débil**: la mayor parte de la información sobre competidores es afirmación comercial, no comprobada.

## 11. Preguntas abiertas

- ¿La cancelación tardía cuenta como ausencia?
- ¿Se permiten sobreturnos explícitos, es decir, saltarse la regla de solapamiento con una confirmación?
- ¿Se registra la obra social del paciente en el MVP, aunque sea como texto?
- ¿Cuál es el precio objetivo para el independiente?
- ¿En qué moneda cobra DentalSoft? (No evidenciado.)
- ¿AgendaPro ofrece una prueba gratuita de 14 días o un plan gratuito permanente? Los precios de los cuatro planes fueron verificados el 25/11/2026, pero estas condiciones no pudieron confirmarse.
- ¿Está MedicAI realmente inscripto en ReNaPDiS N° 292? No se verificó en el listado oficial.
- ¿Qué funcionalidades tiene realmente Reservo? (Evidencia mínima.)
- Doctoralia, XIAgenda y Curve Dental: fuentes no accesibles, quedan como No evidenciado.
