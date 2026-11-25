# Visión y Objetivos

> Fuente: [docs/discovery/discovery.md](../docs/discovery/discovery.md) e [informe-discovery.md](../docs/discovery/informe-discovery.md), con datos relevados el 2026-11-24.

## Propósito del sistema

**Agenda de turnos con reglas verificables para el odontólogo que atiende solo en Argentina.** El sistema evita turnos superpuestos, respeta el horario de atención y los bloqueos, distingue las cancelaciones tardías y permite recordar el turno por WhatsApp con un clic, sin pagar por mensaje.

Hoy el odontólogo independiente organiza su agenda con WhatsApp manual, papel o planillas. Eso produce dobles reservas, ausencias sin aviso y tiempo perdido confirmando a mano. Las soluciones relevadas no le resuelven el problema:

| Grupo | Sistemas | Por qué no le sirve |
|---|---|---|
| Pensadas para clínicas | Dentalink, Clinicorp, Simples Dental | Apuntan a varios profesionales y sucursales |
| Médicas generalistas | DrApp, MedicAI | No tienen odontograma |
| WhatsApp como costo aparte | DrApp, MedicAI, DentalSoft | El odontólogo paga un cargo extra, un add-on o un monto por mensaje |

Ver la sección C del informe.

## Objetivos por actor

| Actor | Objetivo principal | Objetivos secundarios |
|---|---|---|
| Odontólogo independiente | Tener una agenda sin solapamientos que respete su horario y sus bloqueos | Reducir ausencias con recordatorios por WhatsApp sin costo, registrar asistencia, distinguir cancelaciones tardías |
| Paciente (indirecto) | Recibir un recordatorio claro de su turno | Que el mensaje no exponga datos de salud |

## Alcance v0.1 (MVP)

El sistema es una API REST con un frontend web mínimo para un único odontólogo.

1. **Acceso:** inicio de sesión del odontólogo.
2. **Configuración del consultorio:** datos del consultorio, horario de atención por día de la semana y anticipación mínima de cancelación (24 h por defecto, configurable).
3. **Catálogo de prestaciones:** cada prestación tiene una duración por defecto.
4. **Pacientes:** alta y edición con datos mínimos.
5. **Turnos:** crear, reprogramar y cancelar **sin solapamientos del profesional**, dentro del horario de atención, fuera de los bloqueos y nunca en el pasado.
6. **Bloqueos de agenda:** feriados, vacaciones y ausencias.
7. **Agenda:** vista diaria y semanal.
8. **Asistencia:** registro de asistió o ausente.
9. **Recordatorio:** enlace `wa.me` con el mensaje prearmado, sin datos clínicos.

## Fuera de alcance (etapas posteriores)

Según la sección D.3 del informe de Discovery, quedan afuera:

- Turnero online para el paciente.
- WhatsApp Business API con envío automático.
- Señas y cobros con Mercado Pago.
- Facturación electrónica ARCA.
- Obras sociales y liquidaciones.
- Odontograma, periodontograma e historia clínica.
- Varios profesionales, sillones o boxes.
- Lista de espera y sobreturnos.
- Reportes de ausentismo e ingresos.
- App móvil nativa.

## Métricas de éxito

| Métrica | Meta del MVP | Cómo se mide |
|---|---|---|
| Turnos superpuestos creados | 0 | Tests automatizados de las reglas RN-TU y restricción en la base de datos |
| Reglas de agenda cubiertas por tests | 100 % de los escenarios del spec | Suite de tests en verde (Etapa 6) |
| Tiempo para enviar un recordatorio | Un clic desde la agenda | Flujo F-05 |
| Datos clínicos en mensajes | 0 | Test de RN-RE-02 |

## Posicionamiento frente a la competencia

| Competidor | Qué ofrece | Nuestra diferencia en el MVP |
|---|---|---|
| DentalSoft (AR) | Odontología, obras sociales, Mercado Pago; solapamientos solo declarados | Reglas de agenda especificadas y probadas; WhatsApp sin costo por mensaje |
| AgendaPro (AR/LatAm) | Agenda por sillón, IA en WhatsApp, desde $13.900 ARS por mes | Producto simple para el profesional independiente |
| Doctocliq (LatAm) | Plan gratis, odontograma; sin adaptación a Argentina | Foco en reglas de agenda y contexto argentino |
| DrApp / MedicAI (AR) | ARCA y Mercado Pago, sin odontología; WhatsApp pago | Orientado al odontólogo; recordatorio incluido |
