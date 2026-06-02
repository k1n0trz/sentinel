# Sentinel Cloud Roadmap

Este roadmap conecta el estado actual del repositorio con el objetivo de probar Sentinel como un super agente de ciberseguridad defensiva.

## Estado Actual

Ya existe:

- Monorepo con `apps/web`, `apps/api`, `packages/shared` y tooling base.
- API Fastify con health check, rate limiting global y scanner pasivo inicial.
- Scanner MVP para URL, status HTTP, redirects, security headers, SSL basico, DNS basico, findings y scoring.
- Web interna provisional en `localhost:3100`.
- API local en `localhost:4100`.
- Prisma schema preparado para usuarios, proyectos, dominios, scans, findings, reports y alerts.
- Docker Compose con PostgreSQL y Redis.
- Docs base de producto, arquitectura, API, seguridad y ficha tecnica.

Limitaciones actuales:

- Los scans se guardan en memoria, no en PostgreSQL.
- No hay autenticacion ni ownership verification.
- No hay separacion formal entre demo publico y app profesional.
- No hay jobs recurrentes ni monitoreo continuo.
- No hay Playwright sandbox, analisis de APIs, subdominios, WordPress, repositorios ni modulo IA.

## Arquitectura de Producto

### `sentinelcloud.dev`

Sitio publico y demo gratuito. El frontend principal se desarrollara fuera de este repo inicialmente y luego se integrara.

Objetivo del demo:

- Funcionar como SecurityHeaders, pero con mejor UX, mejor explicacion y mas contexto.
- Permitir un scan publico pasivo o de bajo impacto.
- Capturar leads sin exigir cuenta.
- Mostrar resultados entendibles para cliente no tecnico y accionables para desarrollador.

Reglas del demo:

- Solo checks pasivos o de bajo impacto.
- Sin fuerza bruta.
- Sin payloads agresivos.
- Sin extraccion de datos sensibles.
- Rate limiting estricto.
- Opcion de ocultar resultados publicos.
- Opcion de seguir redirects.
- No permitir scans profundos sin verificacion de dominio.

### `app.sentinelcloud.dev`

Aplicativo profesional SaaS que se vendera por planes.

Objetivo:

- Gestionar usuarios, proyectos, dominios verificados, scans guardados, reportes, alertas, historial, monitoreo y modulos avanzados.
- Convertir Sentinel en una capa preventiva continua, no solo en un scanner puntual.

Reglas de la app:

- Requiere autenticacion.
- Requiere verificacion de dominio para scans avanzados.
- Aplica limites por plan.
- Mantiene historial y evidencia.
- Permite monitoreo recurrente.
- Explica riesgos con IA bajo un modelo defensivo y autorizado.

## Fase 1: Endurecer el Demo Publico

Objetivo: tener un demo gratuito comparable a SecurityHeaders, pero mejor explicado.

Acciones:

- Separar endpoint publico `POST /public/scans` del futuro endpoint profesional.
- Agregar opciones `followRedirects` y `hideFromPublicResults`.
- Medir response time, redirect chain, final URL y canonical URL.
- Guardar scans publicos en PostgreSQL con retencion corta.
- Mejorar security headers scanner para detectar `missing`, `weak`, `present` y `misconfigured`.
- Agregar grading tipo A+, A, B, C, D, E, F, R junto al score 0-100.
- Agregar robots.txt y sitemap.xml como checks pasivos.
- Agregar deteccion basica de tecnologias visibles con baja confianza: Cloudflare, Vercel, Netlify, Nginx, Apache, Next.js, WordPress.
- Agregar endpoint publico de reporte compartible.
- Agregar proteccion contra abuso: rate limit por IP, user agent, dominio y ventana temporal.

Criterios de prueba:

- Un visitante puede escanear un dominio y obtener score, grade, findings y recomendaciones.
- El scan no ejecuta payloads ofensivos.
- El resultado no aparece en listados publicos; solo queda disponible por link de reporte y politica de retencion.
- El sistema explica por que falta cada header y como corregirlo.

## Fase 2: Persistencia y SaaS Base

Objetivo: convertir el MVP en app profesional usable.

Acciones:

- Implementar Prisma persistence para scans, findings y reports.
- Crear auth con email/password o magic link.
- Crear modelos funcionales de User, Project y Domain.
- Crear dashboard de `app.sentinelcloud.dev`.
- Crear CRUD de proyectos.
- Crear CRUD de dominios.
- Implementar verificacion de dominio por DNS TXT y archivo `.well-known`.
- Bloquear scans avanzados hasta que el dominio este verificado.
- Crear roles `USER` y `ADMIN`.
- Crear planes `FREE`, `STARTER`, `BUSINESS`, `PRO`, `ENTERPRISE`.
- Agregar limites por plan.

Criterios de prueba:

- Un usuario crea cuenta, proyecto y dominio.
- El dominio no verificado solo permite checks publicos.
- El dominio verificado habilita scans profesionales.
- Los scans quedan guardados con historial.

## Fase 3: Reportes Profesionales

Objetivo: que Sentinel venda valor, no solo datos tecnicos.

Acciones:

- Crear report generator HTML.
- Crear resumen ejecutivo.
- Crear resumen tecnico.
- Crear checklist de hardening.
- Crear findings con evidencia estructurada.
- Agregar estados de finding: `open`, `accepted`, `fixed`, `ignored`.
- Crear comparacion entre scans.
- Crear descarga PDF futura o export HTML imprimible.
- Crear link privado compartible.

Criterios de prueba:

- Un reporte puede enviarse a un cliente no tecnico.
- Un desarrollador puede usar el mismo reporte para corregir.
- El historial muestra si el score mejoro o empeoro.

## Fase 4: Visual Sandbox Tester

Objetivo: convertir Sentinel en un agente que observa la app como un navegador real.

Acciones:

- Integrar Playwright en servicio aislado.
- Capturar screenshot de home.
- Registrar errores de consola.
- Registrar failed requests.
- Detectar mixed content.
- Capturar cookies, localStorage y sessionStorage sin guardar valores sensibles.
- Detectar formularios visibles.
- Medir tiempos de carga basicos.
- Guardar evidencia visual por scan.
- Aislar ejecucion con limites de tiempo y recursos.

Criterios de prueba:

- Un dominio verificado genera evidencia visual.
- El reporte muestra screenshot, errores de consola y requests fallidas.
- No se almacenan tokens ni valores sensibles.

## Fase 5: Expansion de Superficie

Objetivo: ampliar el diagnostico sin romper las reglas defensivas.

Acciones:

- Subdomain discovery pasivo con lista controlada.
- API exposure scanner para rutas comunes autorizadas.
- CORS scanner basico.
- Frontend risk analyzer para sourcemaps, comentarios sensibles y variables publicas sospechosas.
- DNS avanzado: A, AAAA, CNAME, MX, TXT, NS, SPF, DKIM, DMARC.
- WordPress/WooCommerce Guardian sin login ni fuerza bruta.
- Technology fingerprinting con niveles de confianza.

Criterios de prueba:

- Sentinel identifica exposiciones comunes sin explotar.
- Todo modulo avanzado requiere dominio verificado.
- Cada hallazgo tiene impacto, evidencia y recomendacion.

## Fase 6: Monitoreo Continuo

Objetivo: crear valor recurrente y MRR.

Acciones:

- Integrar BullMQ y Redis para jobs.
- Crear scheduler manual, diario, semanal y mensual.
- Detectar cambios de score.
- Detectar headers eliminados.
- Alertar SSL proximo a vencer.
- Alertar cambios DNS.
- Alertar nuevo subdominio.
- Alertar caida del sitio.
- Crear canales de alerta: email primero, luego Slack, Discord, Telegram, WhatsApp.

Criterios de prueba:

- Un dominio verificado puede monitorearse semanalmente.
- El usuario recibe alerta ante un cambio critico.
- El historial compara scans anteriores.

## Fase 7: AI Security Analyst

Objetivo: que Sentinel explique como consultor y priorice como analista.

Acciones:

- Crear interfaz `AIProvider` desacoplada de proveedor.
- Crear prompts por modulo: executive, technical, remediation, client summary.
- Generar resumen ejecutivo.
- Generar plan de correccion por prioridad.
- Generar mensaje para cliente no tecnico.
- Generar mensaje para desarrollador.
- Agregar guardrails para no sugerir explotacion ofensiva.
- Agregar revision de consistencia: la IA solo puede explicar findings detectados.

Criterios de prueba:

- El reporte IA es accionable y no inventa hallazgos.
- La explicacion distingue riesgo tecnico e impacto de negocio.
- Las recomendaciones son defensivas.

## Fase 8: App Profesional Comercial

Objetivo: preparar venta real.

Acciones:

- Crear billing con Stripe primero.
- Implementar limites por plan.
- Crear onboarding.
- Crear admin panel.
- Crear pagina de plan y uso.
- Crear trial o free scan lead capture.
- Crear plantillas de auditoria express, ecommerce y web + API.

Criterios de prueba:

- Un usuario puede pasar de demo gratis a cuenta.
- Un usuario puede agregar dominios segun su plan.
- El sistema bloquea features fuera de plan.

## Fase 9: GitHub y Hardening Asistido

Objetivo: que Sentinel pase de diagnostico a accion.

Acciones:

- Integrar GitHub OAuth.
- Leer repos autorizados.
- Analizar dependencias, lockfiles, Dockerfiles, GitHub Actions y archivos sensibles.
- Generar issues con recomendaciones.
- Generar snippets de hardening para Next.js, Express/Fastify, Nginx, Apache, Vercel y WordPress.
- Preparar pull requests futuros bajo aprobacion explicita.

Criterios de prueba:

- Sentinel analiza un repo autorizado.
- Genera issues utiles sin exponer secretos.
- Sugiere hardening aplicable.

## Fase 10: Super Agente Beta

Objetivo: probar Sentinel como agente integral de ciberseguridad defensiva.

Capacidades minimas del beta:

- Demo publico en `sentinelcloud.dev`.
- App profesional en `app.sentinelcloud.dev`.
- Usuarios, proyectos y dominios verificados.
- Scanner pasivo publico.
- Scanner profesional con sandbox visual.
- Subdominios pasivos.
- API exposure basico.
- WordPress/WooCommerce Guardian basico.
- Monitoreo recurrente.
- Alertas.
- Reporte ejecutivo, tecnico y checklist.
- AI Security Analyst.

Criterios de prueba del super agente:

- Escanea un dominio verificado de punta a punta.
- Genera evidencia tecnica y visual.
- Prioriza riesgos.
- Explica impacto comercial.
- Recomienda correcciones.
- Monitorea cambios.
- Alerta incidentes de configuracion.
- Mantiene limites defensivos y autorizados.

## Orden Recomendado de Ejecucion

1. Persistencia de scans publicos.
2. Demo publico estilo SecurityHeaders mejorado.
3. Separacion `public` vs `app`.
4. Auth, proyectos y dominios.
5. Verificacion de dominio.
6. Reportes profesionales.
7. Playwright sandbox.
8. DNS avanzado y tecnologia visible.
9. API exposure y subdominios.
10. Monitoreo recurrente.
11. AI Security Analyst.
12. Billing y planes.
13. GitHub/hardening asistido.

## Decisiones Pendientes

- Proveedor de auth: Auth.js, Clerk, Supabase Auth o custom.
- Proveedor de email: Resend, Postmark o SES.
- Proveedor IA inicial.
- Dominio final y configuracion Vercel.
- Si `apps/web` sera reemplazada por el frontend de Claude o quedara como app shell.
- Politica de retencion para scans publicos.
- Licencia privada o propietaria.
