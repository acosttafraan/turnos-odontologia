# Informe de Discovery — Sistema de gestión de turnos para odontólogos independientes (Argentina)

| | |
|---|---|
| **Materia** | Desarrollo de Software — Trabajo Global |
| **Proyecto** | turnos-odontologia |
| **Integrantes** | (TBD — completar nombres) |
| **Fecha de relevamiento** | 2026-11-24 |
| **Estado del documento** | BORRADOR generado con asistencia de un agente de IA. Pendiente: verificación personal de fuentes por el equipo (sección "Verificación de fuentes") y versión PDF. |

> **Convenciones.** **Comprobado**: la funcionalidad la muestra el producto (precio publicado, tabla de planes, captura de pantalla, documentación o video oficial). **Comercial**: afirmación del proveedor sin demostración. **No evidenciado**: no aparece en ninguna fuente pública consultada; nunca se completa por deducción. La evidencia cruda por sistema está en [`sources/relevamiento-fuentes.md`](sources/relevamiento-fuentes.md).

---

## Resumen ejecutivo

**Qué se investigó.** Se relevaron 16 sistemas que gestionan turnos y agenda para odontología o salud: 6 con oferta orientada a Argentina, 6 latinoamericanos y 4 internacionales de referencia. Para cada uno se leyó el sitio oficial y, cuando existía, la página de precios. Otras 6 fuentes no pudieron leerse (Doctoralia, XIAgenda, Curve Dental, Gesden, Dendoo y Sultapp) y quedaron documentadas como pendientes de verificación manual.

**Principales hallazgos.**
1. **Hay funciones que ya son estándar de mercado:** reserva online, recordatorios por WhatsApp o email, odontograma, presupuestos y caja. No diferencian a nadie.
2. **La prevención de solapamientos casi no está demostrada.** Solo DentalSoft y Simples Dental la mencionan, y únicamente como afirmación comercial. Ningún sistema la muestra funcionando.
3. **El WhatsApp se cobra aparte.** Es estándar en los líderes, pero en DrApp es un cargo extra, en MedicAI un add-on desde $19.900 + IVA por mes, en DentalSoft cuesta USD 0,026 por mensaje y en Dentidesk figura como "próximamente".
4. **El hueco argentino.** Los líderes regionales (Dentalink, Doctocliq, Simples Dental, Clinicorp) no evidencian ARCA, Mercado Pago ni obras sociales. Los argentinos que sí los tienen (DrApp, MedicAI) son médicos generalistas, sin odontograma. Solo DentalSoft combina odontología con obras sociales y Mercado Pago.
5. **Casi toda la evidencia es comercial.** Las cifras de adopción son autodeclaradas e incluso inconsistentes dentro de un mismo proveedor (AgendaPro).

**MVP recomendado.** Una agenda para el **odontólogo independiente** con reglas de negocio verificables: horario de atención, prestaciones con duración, bloqueos, y alta, reprogramación y cancelación de turnos **sin solapamientos**, más registro de asistencia. Se suma el **recordatorio por WhatsApp mediante enlace `wa.me`**, sin costo por mensaje. El MVP no tiene integraciones externas reales. El turnero online del paciente, la API de WhatsApp, Mercado Pago, ARCA, las obras sociales y la historia clínica quedan para etapas posteriores.

---

## A. Tabla comparativa

Fecha de consulta de todas las fuentes: **2026-11-24**. El orden es por relevancia para Argentina: presencia y adaptación local, foco odontológico y luego alcance regional.

### A.1 Identificación

| # | Producto / Proveedor | País · Segmento | Modalidad | Fuente oficial |
|---|---|---|---|---|
| 1 | DentalSoft / (razón social No evidenciado) | Argentina (La Plata, Rosario) · consultorio y clínica odontológica | Nube (Comercial) | https://dentalsoft.com.ar/ · https://www.dentalsoft.com.ar/funcionalidades |
| 2 | AgendaPro / AgendaPro Inc. | Origen No evidenciado, sitio AR en ARS · consultorio, clínica, multisede | Nube + apps (Comercial) | https://agendapro.com/ar/dental/software-odontologico · https://agendapro.com/ar |
| 3 | DrApp / (No evidenciado) | Argentina (sitio es-AR) · consultorio médico multiespecialidad | Nube + app (Comercial) | https://www.drapp.com.ar/ |
| 4 | MedicAI / MEDICAI S.A.S. | Argentina · consultorio de 1-15 prof., clínica multisede | Nube (Comercial) | https://www.medicai.com.ar/ |
| 5 | MrTurno / RAS Rent a Soft S.A. | Argentina (Mendoza) · marketplace para pacientes | Web + app (Comprobado) | https://www.mrturno.com/ |
| 6 | Reservo / (No evidenciado) | Origen No evidenciado, dice apuntar a "consultorios argentinos" · consultorio | No evidenciado | https://reservo.cl/ |
| 7 | Doctocliq / (No evidenciado) | Perú, México, Ecuador, Colombia (Argentina no figura) · consultorio y clínica dental | Nube + apps (Comprobado) | https://www.doctocliq.com/ · /planes-y-precios · /software-dental |
| 8 | Dentalink / Engenis SpA | Chile · independiente a clínica multisede | Nube (Comercial) | https://www.softwaredentalink.com/ · /planes |
| 9 | Medilink / (No evidenciado) | Chile, Colombia, México · centro médico (sin página dental) | Nube (Comercial) | https://www.softwaremedilink.com/ · /planes |
| 10 | Dentidesk / (No evidenciado) | Chile · clínica dental | Web + apps (Comprobado) | https://www.dentidesk.com/ · /dentidesk/feature |
| 11 | Medesk / (No evidenciado) | LatAm, foco en Colombia · clínica y consultorio | Web (Comercial) | https://www.medesk.net/es/ · /es/pricing/ |
| 12 | Simples Dental / (No evidenciado) | Brasil · dentista, clínica, franquicia | Nube + apps (Comercial) | https://www.simplesdental.com/ · /planos-e-precos |
| 13 | Clinicorp / Clinicorp Solutions | Brasil · clínica dental y estética, franquicia | Nube + apps (Comercial) | https://www.clinicorp.com/ · /planos |
| 14 | Clinic Cloud / Doctoralia España SL | España · clínica sanitaria (odontología en el plan Max) | Nube (Comercial) | https://clinic-cloud.com/ · /tarifas |
| 15 | Open Dental / Open Dental Software | EE.UU. · consultorio a empresa | Local o nube (Comprobado) | https://www.opendental.com/ · /site/fees.html |
| 16 | Dentally / Henry Schein One UK | Reino Unido · consultorio a grupo multisede | Nube (Comercial) | https://dentally.com/ · /en-gb/pricing |

### A.2 Turnos y agenda

| # | Producto | Reserva online | Recordatorios (canal) | Prevención de solapamientos | Sillón/box | Bloqueos | Lista de espera |
|---|---|---|---|---|---|---|---|
| 1 | DentalSoft | Comercial (24/7, subdominio propio) | Comprobado (WhatsApp manual o automático según plan; email) | Comercial ("detección automática de solapamiento") | No evidenciado | Comercial (feriados) | No evidenciado |
| 2 | AgendaPro | Comercial (24/7, web, redes, Google) | Comercial (WhatsApp con IA) | No evidenciado | Comercial | No evidenciado | No evidenciado |
| 3 | DrApp | Comprobado (marketplace Crontu, captura) | Comercial (email; WhatsApp con cargo extra) | No evidenciado | No evidenciado | No evidenciado | No evidenciado |
| 4 | MedicAI | Comercial (turnera 24 h) | Comprobado (email incluido; WhatsApp como add-on pago) | No evidenciado | No evidenciado | Comercial (vía Google Calendar) | No evidenciado |
| 5 | MrTurno | Comprobado (lado paciente) | Comercial (aviso en la app) | No evidenciado | No evidenciado | No evidenciado | No evidenciado |
| 6 | Reservo | Comercial ("turnero online") | No evidenciado | No evidenciado | No evidenciado | No evidenciado | No evidenciado |
| 7 | Doctocliq | Comprobado (todos los planes) | Comprobado (WhatsApp, 50-150 por mes según plan) | No evidenciado | No evidenciado | No evidenciado | No evidenciado |
| 8 | Dentalink | Comprobado (todos los planes) | Comercial (WhatsApp, email) | No evidenciado | No evidenciado | No evidenciado | No evidenciado |
| 9 | Medilink | Comprobado | Comprobado (email; WhatsApp gestionado) | No evidenciado | No evidenciado | No evidenciado | No evidenciado |
| 10 | Dentidesk | Comercial (botón para la web) | Comercial (email; WhatsApp "próximamente") | No evidenciado | No evidenciado | Comercial (feriados) | No evidenciado |
| 11 | Medesk | Comprobado (incluso en el plan gratis) | Comprobado (email; SMS con proveedor propio) | No evidenciado | No evidenciado | No evidenciado | No evidenciado |
| 12 | Simples Dental | Comercial (link de agendamiento) | Comercial (WhatsApp por API, SMS, app) | Comercial | Comprobado (tabla: "Controle por cadeiras") | Comercial | Comercial |
| 13 | Clinicorp | Comprobado (tabla de planes) | Comprobado (WhatsApp, SMS, email, app) | No evidenciado | No evidenciado | No evidenciado | No evidenciado |
| 14 | Clinic Cloud | Comprobado (vía Doctoralia) | Comercial (WhatsApp, email; SMS extra) | No evidenciado | Comercial (salas y boxes) | No evidenciado | No evidenciado |
| 15 | Open Dental | Comprobado (Web Sched, USD 75/mes) | Comprobado (texto, USD 0,04 por mensaje) | No evidenciado | No evidenciado | Comercial (beta) | No evidenciado |
| 16 | Dentally | Comprobado (planes Essentials y Pro) | Comercial (canal no especificado) | No evidenciado | Comprobado (precio por sillón) | No evidenciado | Comercial |

### A.3 Clínica, administración y modelo comercial

| # | Producto | Odontograma / Periodontograma | Mercado Pago · ARCA · Obras sociales | Precio publicado | Prueba / plan gratis |
|---|---|---|---|---|---|
| 1 | DentalSoft | Comprobado (captura) / No evidenciado | Comprobado (MP en Pro) · No evidenciado · Comprobado (captura de liquidación OSDE, ilustrativa) | Gestión $30.000; Pro $60.000 por profesional y mes, moneda no indicada | Plan gratis por 3 meses (Comprobado) |
| 2 | AgendaPro | Comercial / No evidenciado | Comercial · No evidenciado · No evidenciado | "Desde $13.900 ARS por mes" (Comprobado en FAQ); la página /precios dio 404 | 14 días (Comercial) / sin plan gratis |
| 3 | DrApp | No evidenciado / No evidenciado | Comprobado (comisión publicada) · Comercial (plan Premium) · Comercial (recetas) | $33.999 a $45.999 por agenda y mes + IVA (Comprobado) | 15 días (Comercial) |
| 4 | MedicAI | No evidenciado / No evidenciado | Comercial · Comercial · Comercial (lista de prepagas) | $25.900 + IVA por profesional y mes (Comprobado) | 30 días (Comercial) |
| 5 | MrTurno | No evidenciado / No evidenciado | No evidenciado | No evidenciado | No evidenciado |
| 6 | Reservo | No evidenciado / No evidenciado | Comercial · Comercial · No evidenciado | No evidenciado | No evidenciado |
| 7 | Doctocliq | Comprobado / Comprobado | No evidenciado · No evidenciado (factura solo PE/MX/CO/EC) · No evidenciado | USD 0 / 19 / 29 / 49 por mes (Comprobado) | 7 días / plan gratis permanente (Comprobado) |
| 8 | Dentalink | Comprobado / Comprobado | No evidenciado · No evidenciado · No evidenciado ("convenios") | Solo por cotización (Comprobado) | No evidenciado |
| 9 | Medilink | No evidenciado / No evidenciado | No evidenciado | Solo por cotización (Comprobado) | No evidenciado |
| 10 | Dentidesk | Comercial / No evidenciado (ficha de periodoncia, Comercial) | No evidenciado | No evidenciado | 15 días (Comercial) |
| 11 | Medesk | Comercial / No evidenciado | No evidenciado | Pro "$16/mes por 50 citas", moneda no indicada (Comprobado) | 7 días / plan gratis (Comprobado) |
| 12 | Simples Dental | Comprobado / No evidenciado | No aplica (Brasil) | Desde R$ 112,42 por mes (Comprobado) | 7 días (Comercial) |
| 13 | Clinicorp | Comprobado / No evidenciado | No aplica (Brasil) | Desde R$ 111,93 por mes + implementación (Comprobado) | No evidenciado |
| 14 | Clinic Cloud | Comprobado (plan Max) / Comprobado | No aplica (España) | 29 / 49 / 79 € + IVA por mes (Comprobado) | 15 días (Comprobado) |
| 15 | Open Dental | Comprobado (captura 3D) / No evidenciado | No aplica | USD 89 por mes por ubicación, tarifa "Other Countries" (Comprobado) | Enlace a versión de prueba, contenido no leído |
| 16 | Dentally | Comercial / No evidenciado | No aplica (Reino Unido) | Desde £134 por mes (Comprobado) | No evidenciado |

---

## B. Matriz de puntuación (0 a 5)

| Sistema | Turnos y automatización (25 %) | Clínica odontológica (20 %) | Integraciones locales y WhatsApp (15 %) | Administración, cobros y facturación (15 %) | Experiencia del paciente (10 %) | Seguridad, exportación y trazabilidad (10 %) | Precio y adopción (5 %) | **Total ponderado** |
|---|---|---|---|---|---|---|---|---|
| DentalSoft | 4 | 4 | 4 | 4 | 3 | 3 | 4 | **3.80** |
| Simples Dental | 5 | 4 | 2 | 4 | 4 | 3 | 3 | **3.80** |
| AgendaPro | 4 | 3 | 4 | 3 | 4 | 2 | 3 | **3.40** |
| Clinic Cloud | 3 | 4 | 1 | 4 | 3 | 4 | 4 | **3.20** |
| Clinicorp | 4 | 4 | 1 | 4 | 3 | 2 | 2 | **3.15** |
| MedicAI | 3 | 1 | 4 | 4 | 3 | 4 | 4 | **3.05** |
| Dentalink | 3 | 5 | 1 | 3 | 3 | 3 | 2 | **3.05** |
| DrApp | 3 | 1 | 4 | 4 | 4 | 2 | 4 | **2.95** |
| Doctocliq | 3 | 4 | 2 | 2 | 2 | 2 | 5 | **2.80** |
| Medesk | 3 | 2 | 2 | 2 | 3 | 2 | 4 | **2.45** |
| Open Dental | 3 | 3 | 1 | 2 | 2 | 1 | 3 | **2.25** |
| Dentally | 3 | 3 | 0 | 2 | 2 | 2 | 2 | **2.15** |
| Dentidesk | 2 | 4 | 0 | 3 | 2 | 1 | 2 | **2.15** |
| Medilink | 3 | 1 | 1 | 3 | 2 | 1 | 1 | **1.90** |
| Reservo | 1 | 1 | 2 | 2 | 1 | 0 | 0 | **1.15** |
| MrTurno | 1 | 0 | 1 | 0 | 3 | 2 | 1 | **0.95** |

**Nota metodológica.**
- **Escala.** 0 = sin evidencia pública del criterio. 1 = una función aislada. 2 = cobertura parcial. 3 = cobertura básica completa. 4 = cobertura amplia. 5 = cobertura amplia con funciones avanzadas Comprobadas.
- **Datos "No evidenciados".** Una subfunción No evidenciada suma 0 al criterio. No se presume que exista.
- **Afirmaciones comerciales.** Una subfunción solo Comercial cuenta como media, frente a una Comprobada. Por eso ningún sistema que depende solo de marketing en un criterio supera 4.
- **Integraciones locales.** Premia Mercado Pago, ARCA, obras sociales, Google Calendar y WhatsApp. A los sistemas extranjeros sin adaptación argentina les corresponde 0-2 aunque tengan otras integraciones.
- **Total.** Total = Σ(nota × peso). Las notas son juicio del equipo sobre la evidencia de la sección A y deben revisarse tras la verificación de fuentes.
- **Fuentes no leídas.** Los sistemas con fuentes no leídas (Doctoralia, XIAgenda, Curve Dental) no se puntúan.

---

## C. Análisis competitivo

### C.1 Funcionalidades estándar de mercado
- Agendamiento online, presente en 13 de los 16 sistemas.
- Recordatorios automáticos por email o WhatsApp.
- Odontograma en los productos con foco dental.
- Presupuestos, caja y reportes.
- Varios profesionales y sucursales en los planes superiores.
- Prueba gratis de 7 a 30 días.
- Asistentes de IA en WhatsApp como nueva capa (AgendaPro, Dentalink, Doctocliq, Clinicorp). Casi siempre se cobran aparte.

### C.2 Diferenciadores reales (con evidencia Comprobada)
- **Gestión por sillón.** Solo es Comprobada en Simples Dental (tabla de planes) y en Dentally (precio por sillón).
- **Plan gratis permanente.** Doctocliq y Medesk, con precio publicado.
- **Integración argentina.** Comisiones de Mercado Pago publicadas en DrApp, y WhatsApp con precio publicado en MedicAI y DentalSoft.
- **Periodontograma.** Comprobado solo en Dentalink, Doctocliq y Clinic Cloud.

### C.3 Vacíos frecuentes del mercado argentino
1. **Nadie demuestra las reglas de agenda.** Ningún sistema muestra en una fuente comprobable cómo evita solapamientos ni qué pasa en los casos borde (un turno que empieza justo cuando termina otro, cambios de duración).
2. **WhatsApp con costo variable o como add-on** en los productos argentinos: el odontólogo independiente paga por mensaje o por paquete.
3. **Odontología y Argentina no se combinan.** Los productos odontológicos completos no evidencian ARCA ni obras sociales, y los argentinos con ARCA no tienen odontograma. Solo DentalSoft cubre ambos, y parcialmente.
4. **Cumplimiento normativo declarado pero no demostrado.** Solo AgendaPro y MedicAI citan las leyes 25.326 y 26.529, y lo hacen como afirmación comercial.
5. **Transparencia de precios dispar.** Dentalink, Medilink y Dentidesk no publican precios, y DentalSoft y Medesk no indican la moneda.

### C.4 Oportunidades de innovación
- **Agenda con reglas verificables y documentadas** (solapamiento, horario, bloqueos y cancelación con anticipación configurable), pensada para el profesional que trabaja solo.
- **Recordatorio por WhatsApp sin costo por mensaje**, con enlace `wa.me` y mensaje prearmado **sin datos clínicos**. Evita el costo y la dependencia de la API de Meta en la primera etapa.
- **Precio simple para el independiente.** Los productos argentinos cobran por agenda o por profesional entre $25.900 y $60.000 por mes.
- **Etapas posteriores con diferencial local:** obras sociales + ARCA + odontograma en un mismo producto, que es el hueco del punto C.3.

---

## D. Recomendación final

### D.1 Cinco competidores prioritarios para analizar mediante demo
1. **DentalSoft.** Es el competidor local más directo: odontología, obras sociales y Mercado Pago.
2. **AgendaPro.** Líder regional con oferta argentina y gestión por sillón.
3. **DrApp.** Referente argentino en ARCA, Mercado Pago y marketplace de pacientes.
4. **Doctocliq.** Su plan gratis y su odontograma y periodontograma Comprobados marcan el piso de precio.
5. **MedicAI.** Es el que más declara sobre cumplimiento normativo argentino.

### D.2 Tres productos de referencia para la experiencia de usuario
1. **Simples Dental.** Agenda por sillones, encaje y lista de espera.
2. **AgendaPro.** Flujo de reserva y confirmación por WhatsApp.
3. **Doctocliq.** Tabla de planes clara y onboarding con plan gratis.

### D.3 MVP sugerido

**Imprescindible**
- Configuración del consultorio: horario de atención por día de la semana y anticipación mínima de cancelación (24 h por defecto, configurable).
- Catálogo de prestaciones con duración por defecto.
- Alta básica de pacientes con datos ficticios en todos los ejemplos.
- **Crear turno evitando solapamientos del profesional**, dentro del horario de atención y fuera de los bloqueos. Un turno que empieza justo cuando termina otro es válido.
- Reprogramar y cancelar un turno, liberando el horario. Distinguir la cancelación en término de la tardía.
- Bloqueos de agenda (feriados, vacaciones).
- Vista de agenda diaria y semanal.
- Registro de asistencia y ausencia.

**Diferenciador**
- Recordatorio por WhatsApp con enlace `wa.me` y mensaje prearmado sin datos clínicos, incluido en el precio y sin costo por mensaje.
- Reglas de agenda documentadas como especificación verificable, con escenarios y tests.

**Etapas posteriores**
- Turnero online para el paciente.
- WhatsApp Business API automático.
- Señas con Mercado Pago.
- Facturación ARCA.
- Obras sociales y liquidaciones.
- Odontograma, periodontograma e historia clínica.
- Varios profesionales y sillones, lista de espera y sobreturnos.
- Reportes de ausentismo.

---

## Verificación de fuentes

> **A completar por el equipo, no por el agente.** La consigna exige abrir personalmente al menos 5 fuentes, una de cada tipo, y anotar si lo que el informe afirma está realmente en esa URL. Las filas sugeridas cubren los tipos pedidos.

| # | Tipo de fuente | URL | Qué afirma este informe | ¿Está en la URL? (sí / no / parcial) | Qué encontraron | Corrección aplicada | Verificó (nombre, fecha) |
|---|---|---|---|---|---|---|---|
| 1 | Sitio oficial | https://dentalsoft.com.ar/ | "Sobreturnos con detección automática de solapamiento"; hecho en Argentina | | | | |
| 2 | Página de precios | https://www.doctocliq.com/planes-y-precios | Planes de USD 0, 19, 29 y 49 por mes; odontograma y periodontograma en todos los planes | | | | |
| 3 | Página de precios | https://www.medicai.com.ar/ (FAQ y precios) | Premium $25.900 + IVA; WhatsApp como add-on de $19.900 o $29.900 | | | | |
| 4 | Tabla de planes / funcionalidades | https://www.softwaredentalink.com/planes | Odontograma y periodontograma en todos los planes; precio solo por cotización | | | | |
| 5 | Sitio oficial (FAQ) | https://agendapro.com/ar | "Planes desde $13.900 ARS por mes"; prueba de 14 días; sin plan gratis | | | | |
| 6 | Fuente no accesible al agente | https://pro.doctoralia.com.ar/ | No evidenciado (no se pudo leer) | | | | |

**Hallazgos a registrar para la reflexión:**
- **Inconsistencias que el agente detectó:** las cifras de AgendaPro no coinciden entre páginas, el precio de Clinicorp es distinto en la home y en la página de planes, y DentalSoft y Medesk no indican la moneda.
- **Dominios incorrectos:** gesden.com y dendoo.com no corresponden a los productos buscados.
- **Fuentes que el agente no pudo leer:** Doctoralia, XIAgenda y Curve Dental.

---

## Referencias

Todas consultadas el 2026-11-24.

**Sitios oficiales**
- AgendaPro: https://agendapro.com/ar/dental/software-odontologico · https://agendapro.com/ar
- Clinic Cloud: https://clinic-cloud.com/ · /tarifas · /prueba-gratis · /agenda
- Clinicorp: https://www.clinicorp.com/ · /planos
- DentalSoft: https://dentalsoft.com.ar/ · https://www.dentalsoft.com.ar/funcionalidades
- Dentalink: https://www.softwaredentalink.com/ · /planes
- Dentally: https://dentally.com/ · https://www.dentally.com/en-gb/pricing · /en-gb/dental-software-features
- Dentidesk: https://www.dentidesk.com/ · /dentidesk/feature · /dentidesk/solution
- Doctocliq: https://www.doctocliq.com/ · /planes-y-precios · /software-dental
- DrApp: https://www.drapp.com.ar/
- MedicAI: https://www.medicai.com.ar/
- Medesk: https://www.medesk.net/es/ · /es/pricing/ · /es/solutiones/odontologia/
- Medilink: https://www.softwaremedilink.com/ · /planes
- MrTurno: https://www.mrturno.com/
- Open Dental: https://www.opendental.com/ · /site/fees.html · /site/documentation.html
- Reservo: https://reservo.cl/
- Simples Dental: https://www.simplesdental.com/ · /planos-e-precos · /agenda-online · /whatsapp

**Fuentes de contexto (secundarias)**
- Tesis MBA UdeSA (Sultapp; unos 70.000 odontólogos en Argentina, de los cuales ~3 % usa herramientas tecnológicas): https://repositorio.udesa.edu.ar/jspui/bitstream/10908/23801/1/%5bP%5d%20%5bW%5d%20MBA%20Nervi%2c%20Santiago%20Luis.pdf
- Forbes Argentina sobre DrApp: https://www.forbesargentina.com/negocios/10-promesas-como-drapp-plataforma-gestion-consultorios-medicos-ya-aspira-expandirse-latam-n4674
- GetApp, ficha de DentalSoft: https://www.getapp.com/all-software/a/dentalsoft/
- Develop Argentina, guía de software para clínicas 2026: https://developargentina.com/blog/software-clinicas-consultorios-argentina-2026
