# Sentinel Action Plan

Este plan aterriza el roadmap en bloques de trabajo concretos para avanzar desde el estado actual hasta una beta de super agente.

## Sprint 1: Demo Publico Real

Objetivo: que `sentinelcloud.dev` pueda usar la API como demo gratuito tipo SecurityHeaders mejorado.

Acciones:

- Crear `POST /public/scans`.
- Agregar body:
  - `url`
  - `followRedirects`
  - `hideFromPublicResults`
- Guardar scan en PostgreSQL.
- Crear `GET /public/scans/:id`.
- Crear `GET /public/reports/:scanId`.
- Agregar grade A+ a F.
- Agregar redirect chain.
- Agregar response time.
- Agregar canonical URL.
- Agregar robots.txt y sitemap.xml.
- Agregar public results list.
- Agregar rate limit por IP y dominio.

Entregable:

- API lista para integrarse con el frontend que se esta construyendo para `sentinelcloud.dev`.

## Sprint 2: Scanner de Headers Profesional

Objetivo: superar el valor del demo basico.

Acciones:

- Convertir cada header en evaluacion con `status`, `severity`, `risk`, `recommendation`, `evidence`.
- Distinguir presente vs debil vs mal configurado.
- CSP: detectar ausente, demasiado permisivo, `unsafe-inline`, `unsafe-eval`, wildcard.
- HSTS: detectar max-age bajo, falta de includeSubDomains, falta de preload.
- X-Frame-Options: detectar valores invalidos.
- Referrer-Policy: detectar valores debiles.
- Permissions-Policy: detectar ausente o vacia.

Entregable:

- Reporte de headers con contexto y recomendaciones mejores que un scanner plano.

## Sprint 3: SaaS Shell

Objetivo: preparar `app.sentinelcloud.dev`.

Acciones:

- Elegir auth.
- Crear login/register.
- Crear dashboard privado.
- Crear proyectos.
- Crear dominios.
- Crear verificacion DNS TXT.
- Conectar Prisma persistence.
- Crear historial de scans.

Entregable:

- Un usuario puede registrar un dominio y preparar scans avanzados.

## Sprint 4: Report Generator

Objetivo: convertir resultados en consultoria vendible.

Acciones:

- Crear reporte HTML profesional.
- Crear resumen ejecutivo.
- Crear resumen tecnico.
- Crear checklist de remediacion.
- Crear estado de findings.
- Crear comparacion entre scans.

Entregable:

- Primer reporte vendible para auditoria express.

## Sprint 5: Visual Sandbox

Objetivo: primer salto hacia super agente.

Acciones:

- Integrar Playwright.
- Crear worker aislado.
- Capturar screenshot.
- Capturar console errors.
- Capturar failed requests.
- Detectar mixed content.
- Guardar evidencia visual.

Entregable:

- Scan profesional con evidencia de navegador real.

## Sprint 6: Monitoreo

Objetivo: activar MRR.

Acciones:

- Crear BullMQ queues.
- Crear scan scheduler.
- Crear alertas por email.
- Detectar cambios de score, SSL, DNS y headers.

Entregable:

- Primer plan Starter/Business con monitoreo recurrente.

## Sprint 7: AI Analyst

Objetivo: que Sentinel explique y priorice.

Acciones:

- Crear `AIProvider`.
- Crear prompts defensivos.
- Generar executive summary.
- Generar technical summary.
- Generar remediation plan.
- Agregar guardrails contra recomendaciones ofensivas.

Entregable:

- Reporte IA listo para cliente y desarrollador.

