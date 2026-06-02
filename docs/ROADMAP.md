# Sentinel Cloud Roadmap

Este roadmap conecta el estado actual del repositorio con el objetivo de convertir Sentinel en un agente profesional de ciberseguridad defensiva para sitios web, apps, ecommerce, CMS, APIs e integraciones.

## Vision

Sentinel no debe ser solo un scanner de headers.

La vision es construir un agente de seguridad que:

- Entiende la superficie digital de un proyecto.
- Monitorea dominios, apps, APIs e integraciones.
- Ejecuta diagnosticos pasivos y pruebas autorizadas.
- Navega apps reales en un sandbox visual.
- Genera evidencia tecnica y reportes ejecutivos.
- Prioriza riesgos segun impacto.
- Recomienda hardening aplicable.
- Alerta cambios importantes.
- Se integra con WordPress, WooCommerce, Shopify, GitHub, Vercel, Cloudflare y otros stacks.

Principio base: todo modulo profundo requiere autorizacion explicita y dominio verificado.

## Estado Actual

Ya existe:

- Monorepo con `apps/web`, `apps/api`, `packages/shared` y tooling base.
- API Fastify con health check y rate limiting global.
- Scanner pasivo inicial para URL, status HTTP, redirects, security headers, SSL basico, DNS basico, robots.txt, sitemap.xml, findings y scoring.
- Normalizacion de dominios sin protocolo.
- Endpoint publico `POST /public/scans`.
- Pagina `/diagnostico` con formulario real de scan.
- Reporte publico inicial con summary, grade, score, IP, headers, raw headers, DNS, SSL, redirects y recomendaciones.
- Redireccion de CTAs de la home hacia `/diagnostico`.
- Prisma schema preparado para usuarios, proyectos, dominios, scans, findings, reports y alerts.
- Docker Compose con PostgreSQL y Redis.
- Docs base de producto, arquitectura, API, seguridad y ficha tecnica.

Limitaciones actuales:

- Los scans se guardan principalmente en memoria; la persistencia real aun debe consolidarse.
- No hay autenticacion.
- No hay SaaS shell para `app.sentinelcloud.dev`.
- No hay proyectos ni dominios verificados.
- No hay scheduler ni monitoreo recurrente.
- No hay sandbox visual con Playwright.
- No hay integraciones WordPress, WooCommerce, Shopify, GitHub, Cloudflare o Vercel.
- No hay AI Security Analyst.
- No hay billing ni limites por plan.

## Arquitectura de Producto

### `sentinelcloud.dev`

Sitio publico, marca, contenido, pricing y demo gratuito.

Objetivo:

- Mostrar el valor de Sentinel sin exigir cuenta.
- Permitir un diagnostico publico pasivo de bajo impacto.
- Capturar leads.
- Entregar un reporte entendible y accionable.
- Llevar al usuario hacia `app.sentinelcloud.dev` cuando quiera monitoreo, historial, sandbox, integraciones o reportes profesionales.

Reglas del demo:

- Solo checks pasivos o de bajo impacto.
- Sin fuerza bruta.
- Sin payloads agresivos.
- Sin extraccion de datos sensibles.
- Sin historial publico.
- Sin rankings publicos.
- Sin hall of fame ni hall of shame.
- El resultado solo queda disponible para quien lo solicita por sesion o link de reporte.
- Aplicar rate limit estricto por IP, dominio y ventana temporal.
- No permitir scans profundos sin verificacion de dominio.

### `app.sentinelcloud.dev`

Aplicativo profesional SaaS de pago.

Objetivo:

- Gestionar usuarios, proyectos, dominios verificados, scans, historial, reportes, alertas, sandbox, integraciones y monitoreo continuo.
- Convertir Sentinel en una capa preventiva recurrente, no solo en un scanner puntual.

Reglas de la app:

- Requiere autenticacion.
- Requiere verificacion de dominio para scans avanzados.
- Aplica limites por plan.
- Mantiene historial privado.
- Permite monitoreo recurrente.
- Permite integraciones autorizadas.
- Explica riesgos con IA bajo un modelo defensivo.

## Distribucion por Planes

### Demo Gratuito

Uso: `sentinelcloud.dev/diagnostico`.

Incluye:

- Diagnostico publico de headers.
- SSL basico.
- DNS basico.
- Redirects.
- robots.txt y sitemap.xml.
- Score y grade.
- Reporte basico por sesion o link.
- Opcion de ocultar resultado de cualquier uso interno futuro.

No incluye:

- Historial publico.
- Monitoreo.
- Sandbox.
- Integraciones.
- Dominio verificado.
- AI Analyst avanzado.

Objetivo comercial:

- Capturar leads.
- Demostrar valor rapido.
- Llevar a cuenta paga.

### Starter

Para freelancers, sitios pequenos, landing pages, blogs y negocios con un dominio principal.

Incluye:

- 1 dominio verificado.
- Monitoreo semanal.
- Historial privado de scans.
- Alertas basicas por email.
- Security headers monitoring.
- SSL expiration monitoring.
- DNS basico.
- Reporte mensual basico.
- Checklist de hardening.
- Recomendaciones para Cloudflare, Vercel, Nginx y Apache.

No incluye:

- Sandbox avanzado.
- Integraciones ecommerce profundas.
- AI Analyst completo.
- GitHub scanner.

Objetivo comercial:

- Vender tranquilidad basica y vigilancia continua.

### Business

Plan recomendado para SaaS pequenos, ecommerce, agencias, WordPress, WooCommerce y Shopify inicial.

Incluye:

- 3 dominios verificados.
- Monitoreo diario.
- Alertas por email y canal secundario futuro.
- Sandbox visual basico.
- Screenshot de home.
- Errores de consola.
- Requests fallidas.
- Mixed content.
- Cookies inseguras basicas.
- Formularios visibles.
- WordPress/WooCommerce Guardian basico.
- Shopify theme/app risk basico.
- Reportes para cliente.
- Comparacion antes/despues.

Objetivo comercial:

- Convertir Sentinel en una herramienta util para sitios reales y ecommerce.

### Pro

Para equipos tecnicos, apps con login, APIs, ecommerce serio y agencias con varios clientes.

Incluye:

- 10 dominios o proyectos.
- Monitoreo configurable.
- Sandbox avanzado por rutas.
- Analisis de login, checkout y formularios criticos.
- Deteccion de APIs llamadas desde frontend.
- CORS scanner basico.
- Subdomain discovery pasivo.
- DNS avanzado: A, AAAA, CNAME, MX, TXT, NS, SPF, DKIM, DMARC.
- Technology fingerprinting.
- GitHub integration futura.
- AI Security Analyst.
- Plan de remediacion priorizado.
- Reportes ejecutivos y tecnicos.
- Estados de findings: `open`, `fixed`, `accepted`, `ignored`.

Objetivo comercial:

- Vender un agente de seguridad real para apps y APIs.

### Enterprise

Para empresas, agencias grandes, infraestructura compleja, compliance y necesidades a medida.

Incluye:

- Dominios y proyectos personalizados.
- Monitoreo 24/7 o frecuencias custom.
- Sandbox avanzado con flujos configurados.
- Integraciones personalizadas.
- Slack, Discord, Teams y webhooks.
- Reportes privados compartibles.
- Panel admin.
- SLA.
- Soporte tecnico.
- Compliance light: OWASP, GDPR/privacy posture, auditoria express.
- Supply chain risk.
- GitHub/repo scanner avanzado.
- Hardening asistido.
- Post-Quantum Readiness futuro.
- Politicas de retencion custom.
- White label para agencias.

Objetivo comercial:

- Vender seguridad continua, integraciones y evidencia para operaciones serias.

## Roadmap por Fases

## Fase 1: Demo Publico Real

Objetivo: que `sentinelcloud.dev` tenga un diagnostico publico comparable a SecurityHeaders, pero con mejor explicacion, mejor UX y contexto Sentinel.

Acciones:

- Mantener `/diagnostico` como pantalla dedicada para ejecutar scans publicos.
- Separar endpoint publico `POST /public/scans` del futuro endpoint profesional.
- Medir response time, redirect chain, final URL y canonical URL.
- Guardar scans publicos en PostgreSQL con retencion corta.
- Crear reporte publico compartible por link.
- Mejorar security headers scanner para detectar `missing`, `weak`, `present` y `misconfigured`.
- Agregar grading A+, A, B, C, D, E, F, R junto al score 0-100.
- Agregar robots.txt y sitemap.xml como checks pasivos.
- Agregar deteccion basica de tecnologias visibles con baja confianza: Cloudflare, Vercel, Netlify, Nginx, Apache, Next.js, WordPress.
- Agregar proteccion contra abuso: rate limit por IP, user agent, dominio y ventana temporal.

Criterios de prueba:

- Un visitante puede escanear un dominio y obtener score, grade, findings y recomendaciones.
- El scan no ejecuta payloads ofensivos.
- El resultado no aparece en listados publicos.
- El reporte puede compartirse por link o mantenerse privado segun politica de retencion.
- El sistema explica por que falta cada header y como corregirlo.

## Fase 2: Persistencia y SaaS Shell

Objetivo: empezar `app.sentinelcloud.dev` temprano, sin esperar a terminar todos los scanners.

Acciones:

- Implementar Prisma persistence para scans, findings y reports.
- Crear auth con email/password, magic link, Clerk, Supabase Auth o Auth.js.
- Crear dashboard privado base.
- Crear modelos funcionales de User, Project y Domain.
- Crear CRUD de proyectos.
- Crear CRUD de dominios.
- Crear historial privado de scans.
- Separar vistas publicas (`sentinelcloud.dev`) de vistas privadas (`app.sentinelcloud.dev`).
- Crear roles `USER` y `ADMIN`.
- Crear planes `FREE`, `STARTER`, `BUSINESS`, `PRO`, `ENTERPRISE`.
- Agregar limites por plan.

Criterios de prueba:

- Un usuario crea cuenta.
- Un usuario crea proyecto.
- Un usuario agrega dominio.
- Un usuario ve historial privado de scans.
- El demo publico y la app privada comparten motor, pero no reglas de acceso.

## Fase 3: Verificacion de Dominio

Objetivo: habilitar scans profesionales solo sobre activos autorizados.

Acciones:

- Implementar verificacion DNS TXT.
- Implementar verificacion por archivo `.well-known/sentinel-verification.txt`.
- Guardar estado de verificacion.
- Bloquear scans avanzados hasta que el dominio este verificado.
- Permitir reverificacion periodica.
- Registrar evidencia de verificacion.
- Manejar dominios raiz y subdominios.

Criterios de prueba:

- Un dominio no verificado solo permite checks publicos.
- Un dominio verificado habilita sandbox, monitoreo e integraciones.
- El sistema puede revocar permisos si la verificacion deja de existir.

## Fase 4: Reportes Profesionales

Objetivo: convertir resultados en consultoria vendible.

Acciones:

- Crear reporte HTML profesional.
- Crear resumen ejecutivo.
- Crear resumen tecnico.
- Crear checklist de hardening.
- Crear findings con evidencia estructurada.
- Agregar estados de finding: `open`, `accepted`, `fixed`, `ignored`.
- Crear comparacion entre scans.
- Crear link privado compartible.
- Preparar export PDF futuro o HTML imprimible.
- Crear plantillas de reporte: auditoria express, ecommerce, web + API, WordPress, WooCommerce.

Criterios de prueba:

- Un reporte puede enviarse a un cliente no tecnico.
- Un desarrollador puede usar el mismo reporte para corregir.
- El historial muestra si el score mejoro o empeoro.
- El reporte explica impacto tecnico e impacto de negocio.

## Fase 5: Visual Sandbox Tester

Objetivo: convertir Sentinel en un agente que observa la app como navegador real.

El sandbox pertenece a `app.sentinelcloud.dev`, no al demo publico, porque implica interaccion mas profunda y debe requerir dominio verificado.

MVP del sandbox:

- Abrir la home con Playwright en entorno aislado.
- Capturar screenshot.
- Registrar errores de consola.
- Registrar failed requests.
- Detectar mixed content.
- Detectar formularios visibles.
- Detectar iframes y scripts externos.
- Capturar metadata de cookies sin guardar valores sensibles.
- Medir tiempos de carga basicos.
- Guardar evidencia visual por scan.
- Aislar ejecucion con limites de tiempo y recursos.

Evolucion:

- Rutas configurables.
- Login asistido.
- Checkout/ecommerce flows.
- Form analyzer avanzado.
- Cookie/session analyzer.
- DOM risk scan.
- Network watcher avanzado.
- Evidencia visual por hallazgo.

Criterios de prueba:

- Un dominio verificado genera evidencia visual.
- El reporte muestra screenshot, errores de consola y requests fallidas.
- No se almacenan tokens ni valores sensibles.
- El sandbox produce findings accionables.

## Fase 6: Integraciones CMS y Ecommerce

Objetivo: convertir Sentinel en agente util para negocios reales que usan plataformas comunes.

### WordPress/WooCommerce Guardian

Acciones:

- Detectar WordPress con baja confianza.
- Revisar exposicion de `wp-json`.
- Revisar XML-RPC expuesto.
- Detectar usuarios enumerables si es pasivo y permitido.
- Revisar headers.
- Revisar SSL/DNS.
- Detectar backups publicos comunes sin fuerza bruta.
- Revisar WooCommerce checkout signals.
- Detectar plugins visibles de alto riesgo por version solo si la version esta expuesta publicamente.

### Shopify Guardian

Acciones:

- Detectar Shopify/theme signals.
- Revisar CSP y headers aplicables.
- Revisar dominios y redirects.
- Detectar scripts externos visibles.
- Detectar tracking scripts sospechosos o excesivos.
- Revisar recursos publicos del theme.

Criterios de prueba:

- Sentinel identifica riesgos comunes sin explotar vulnerabilidades.
- Cada hallazgo tiene evidencia y recomendacion.
- Las integraciones profundas requieren dominio verificado o conexion autorizada.

## Fase 7: Expansion de Superficie

Objetivo: ampliar el diagnostico defensivo sin romper limites de autorizacion.

Acciones:

- Subdomain discovery pasivo con lista controlada.
- API exposure scanner para rutas comunes autorizadas.
- CORS scanner basico.
- Frontend risk analyzer para sourcemaps, comentarios sensibles y variables publicas sospechosas.
- DNS avanzado.
- Technology fingerprinting con niveles de confianza.
- Third-party dependency surface: scripts externos, CDNs, pixels y vendors.

Criterios de prueba:

- Sentinel identifica exposiciones comunes sin explotar.
- Todo modulo avanzado requiere dominio verificado.
- Cada hallazgo tiene impacto, evidencia y recomendacion.

## Fase 8: Monitoreo Continuo

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
- Alertar errores nuevos del sandbox.
- Crear canales de alerta: email primero, luego Slack, Discord, Telegram, WhatsApp y webhooks.

Criterios de prueba:

- Un dominio verificado puede monitorearse semanalmente.
- El usuario recibe alerta ante un cambio critico.
- El historial privado compara scans anteriores.

## Fase 9: AI Security Analyst

Objetivo: que Sentinel explique como consultor y priorice como analista.

Acciones:

- Crear interfaz `AIProvider` desacoplada de proveedor.
- Crear prompts por modulo: executive, technical, remediation, client summary.
- Generar resumen ejecutivo.
- Generar resumen tecnico.
- Generar plan de correccion por prioridad.
- Generar mensaje para cliente no tecnico.
- Generar mensaje para desarrollador.
- Agregar guardrails para no sugerir explotacion ofensiva.
- Agregar revision de consistencia: la IA solo puede explicar findings detectados.

Criterios de prueba:

- El reporte IA es accionable y no inventa hallazgos.
- La explicacion distingue riesgo tecnico e impacto de negocio.
- Las recomendaciones son defensivas.

## Fase 10: Hardening Asistido

Objetivo: pasar de diagnostico a accion.

Acciones:

- Generar snippets para Next.js.
- Generar snippets para Express/Fastify.
- Generar snippets para Nginx.
- Generar snippets para Apache.
- Generar reglas sugeridas para Cloudflare.
- Generar recomendaciones para Vercel.
- Generar checklist WordPress/WooCommerce.
- Generar recomendaciones Shopify.
- Crear issues o tareas internas.

Criterios de prueba:

- Sentinel recomienda cambios aplicables.
- Cada recomendacion esta ligada a un finding.
- Ninguna recomendacion ejecuta cambios sin aprobacion.

## Fase 11: GitHub y Supply Chain

Objetivo: analizar repos autorizados y riesgos de cadena de suministro.

Acciones:

- Integrar GitHub OAuth.
- Leer repos autorizados.
- Analizar dependencias, lockfiles, Dockerfiles, GitHub Actions y archivos sensibles.
- Detectar secretos solo con manejo seguro y sin exponer valores.
- Generar issues con recomendaciones.
- Preparar pull requests futuros bajo aprobacion explicita.

Criterios de prueba:

- Sentinel analiza un repo autorizado.
- Genera issues utiles sin exponer secretos.
- Sugiere hardening aplicable.

## Fase 12: Billing y Comercializacion

Objetivo: preparar venta real.

Acciones:

- Crear billing con Stripe.
- Implementar limites por plan.
- Crear onboarding.
- Crear admin panel.
- Crear pagina de plan y uso.
- Crear trial.
- Crear lead capture desde demo publico.
- Crear plantillas comerciales por tipo de cliente: agencia, SaaS, ecommerce, WordPress, WooCommerce.

Criterios de prueba:

- Un usuario puede pasar de demo gratis a cuenta.
- Un usuario puede agregar dominios segun su plan.
- El sistema bloquea features fuera de plan.
- El usuario entiende por que debe subir de plan.

## Fase 13: Future Shield

Objetivo: preparar capacidades premium futuras sin prometer humo.

Modulos posibles:

- Post-Quantum Readiness.
- Inventario TLS/certificados.
- Identificacion de algoritmos criptograficos visibles.
- Recomendaciones de preparacion para migracion post-quantum.
- Compliance posture.
- Supply chain risk avanzado.
- Attack Surface Map.
- Autonomous remediation suggestions bajo aprobacion.

Criterios de prueba:

- El modulo no promete "seguridad cuantica" de forma falsa.
- El enfoque es readiness, inventario y preparacion.
- Las recomendaciones son defensivas, verificables y auditables.

## Fase 14: Super Agente Beta

Objetivo: probar Sentinel como agente integral de ciberseguridad defensiva.

Capacidades minimas del beta:

- Demo publico en `sentinelcloud.dev`.
- App profesional en `app.sentinelcloud.dev`.
- Usuarios, proyectos y dominios verificados.
- Scanner pasivo publico.
- Scanner profesional con sandbox visual.
- WordPress/WooCommerce Guardian basico.
- Shopify Guardian basico.
- Subdominios pasivos.
- API exposure basico.
- DNS avanzado.
- Monitoreo recurrente.
- Alertas.
- Reporte ejecutivo, tecnico y checklist.
- AI Security Analyst.
- Hardening asistido.

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

1. Persistencia real de scans y reports.
2. Link de reporte publico privado/compartible.
3. Rate limiting fino por IP y dominio.
4. SaaS shell de `app.sentinelcloud.dev`.
5. Auth, proyectos y dominios.
6. Verificacion de dominio.
7. Historial privado.
8. Reportes profesionales.
9. Visual Sandbox MVP.
10. Planes y limites.
11. WordPress/WooCommerce Guardian basico.
12. Shopify Guardian basico.
13. DNS avanzado y tecnologia visible.
14. API exposure y subdominios.
15. Monitoreo recurrente.
16. Alertas.
17. AI Security Analyst.
18. Hardening asistido.
19. Billing.
20. GitHub/supply chain.
21. Future Shield.
22. Super Agente Beta.

## Proximo Sprint Recomendado

Sprint recomendado: `SaaS Foundation + Persistencia`.

Por que:

- El demo publico ya existe y comunica valor.
- La app de pago debe empezar temprano.
- Sin persistencia no hay historial privado, reportes compartibles ni monitoreo.
- Sin auth/proyectos/dominios no hay forma de vender planes.

Entregables:

- Scans guardados en PostgreSQL.
- Reportes guardados y consultables por ID.
- Primer dashboard privado.
- Auth inicial.
- CRUD de proyectos.
- CRUD de dominios.
- Estado de verificacion pendiente/verificado.

## Decisiones Pendientes

- Proveedor de auth: Auth.js, Clerk, Supabase Auth o custom.
- Proveedor de email: Resend, Postmark o SES.
- Proveedor IA inicial.
- Dominio final y configuracion Vercel.
- Si `apps/web` sera reemplazada por el frontend de Claude o quedara como app shell.
- Politica de retencion para scans publicos.
- Politica de retencion para evidencia sandbox.
- Limites exactos por plan.
- Precio final de Starter, Business, Pro y Enterprise.
- Licencia privada o propietaria.
