'use client';

import type { ScanResult } from '@sentinel/shared';
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  Check,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Globe,
  LayoutDashboard,
  Lock,
  Menu,
  Monitor,
  Radar,
  ShieldCheck,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { runFreeScan } from '../lib/api';
import { EyeLogo } from './site-shell';

const navItems = [
  ['Inicio', '/'],
  ['Características', '/caracteristicas'],
  ['Soluciones', '/soluciones'],
  ['Sandbox', '/sandbox'],
  ['Precios', '/precios'],
  ['Recursos', '/recursos'],
  ['Contacto', '/contacto'],
] as const;

const problems = [
  'Vulnerabilidades invisibles',
  'Flujos críticos sin testeo real',
  'Alertas difíciles de interpretar',
  'Respuesta lenta ante incidentes',
  'Falta de monitoreo continuo',
];

const skills = [
  'Detección de vulnerabilidades',
  'Análisis de comportamiento sospechoso',
  'Monitoreo de endpoints y APIs',
  'Revisión de formularios y flujos',
  'Detección de errores críticos',
  'Reportes inteligentes',
  'Clasificación de riesgo',
  'Respuesta asistida por IA',
  'Priorización de incidentes',
  'Historial de eventos y auditoría',
  'Integración con apps propias',
  'Alertas inteligentes',
];

const solutions = [
  {
    title: 'Startups SaaS',
    text: 'Protege tu producto desde etapas tempranas con monitoreo, reportes y sandbox visual.',
    icon: Monitor,
  },
  {
    title: 'E-commerce',
    text: 'Reduce riesgos en pagos, formularios, sesiones, headers y flujos de compra.',
    icon: Globe,
  },
  {
    title: 'Respuesta a incidentes',
    text: 'Convierte señales técnicas en prioridades claras y acciones de mitigación.',
    icon: Radar,
  },
  {
    title: 'Empresas y agencias',
    text: 'Ofrece seguridad medible y reportes ejecutivos a clientes y equipos internos.',
    icon: ShieldCheck,
  },
];

const plans = [
  {
    plan: 'Starter',
    desc: 'Para proyectos pequeños, MVPs y sitios web.',
    price: '$19',
    features: ['1 dominio', 'Escaneo semanal', 'SSL monitoring', 'Headers monitoring', 'Reporte mensual'],
  },
  {
    plan: 'Business',
    desc: 'Para negocios digitales, SaaS y e-commerce.',
    price: '$49',
    badge: 'Recomendado',
    featured: true,
    features: ['3 dominios', 'Escaneo diario', 'Sandbox visual', 'API basic scan', 'Alertas email/WhatsApp'],
  },
  {
    plan: 'Pro',
    desc: 'Para equipos con APIs, repositorios e integraciones.',
    price: '$99',
    features: ['10 dominios', 'Sandbox semanal', 'GitHub integration', 'Reporte técnico', 'Historial comparativo'],
  },
  {
    plan: 'Enterprise',
    desc: 'Para operaciones críticas e infraestructura compleja.',
    price: 'Custom',
    features: ['Monitoreo 24/7', 'Auditorías personalizadas', 'Hardening asistido', 'SLA básico', 'Soporte técnico'],
  },
];

const severityOrder = ['critical', 'high', 'medium', 'low', 'info'] as const;

export function SentinelHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [url, setUrl] = useState('https://example.com');
  const [followRedirects, setFollowRedirects] = useState(true);
  const [hideFromPublicResults, setHideFromPublicResults] = useState(false);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const runScan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsScanning(true);

    try {
      setScan(await runFreeScan({ followRedirects, hideFromPublicResults, url }));
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : 'No se pudo ejecutar el diagnóstico.');
    } finally {
      setIsScanning(false);
    }
  };

  const visibleFindings =
    scan?.findings
      .slice()
      .sort((left, right) => severityOrder.indexOf(left.severity) - severityOrder.indexOf(right.severity))
      .slice(0, 5) ?? [];

  return (
    <>
      <header className="header">
        <div className="wrap header-inner">
          <a className="brand" href="#inicio" aria-label="Sentinel Cloud inicio">
            <EyeLogo />
            <span className="brand-name">Sentinel</span>
          </a>
          <nav className="nav" aria-label="Navegación principal">
            {navItems.map(([label, href], index) => (
              <a className={index === 0 ? 'active' : undefined} href={href} key={href}>
                {label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <a className="link-login" href="/login">
              Iniciar sesión
            </a>
            <a className="btn btn-primary btn-sm" href="/contacto">
              Solicitar demo
            </a>
            <button
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="mobile-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {navItems.map(([label, href]) => (
          <a href={href} key={href} onClick={() => setMenuOpen(false)}>
            {label}
          </a>
        ))}
        <a className="btn btn-primary" href="/contacto" onClick={() => setMenuOpen(false)}>
          Solicitar demo
        </a>
      </div>

      <main id="inicio">
        <section className="hero wrap">
          <div>
            <span className="eyebrow">AI-Powered Cyber Security</span>
            <h1>
              IA que vigila.
              <br />
              Inteligencia que <span className="accent">protege</span>.
            </h1>
            <p className="lead">
              Sentinel es un agente de ciberseguridad impulsado por IA que monitorea, analiza y prueba tus aplicaciones
              para detectar riesgos antes de que se conviertan en incidentes.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary btn-lg" href="#demo">
                Probar diagnóstico
              </a>
              <a className="btn btn-ghost btn-lg" href="#como">
                Ver cómo funciona
              </a>
            </div>
            <div className="hero-micro">
              <span>
                <i className="dot" /> Monitoreo continuo
              </span>
              <span>
                <i className="dot" /> Sandbox visual
              </span>
              <span>
                <i className="dot" /> Respuesta inteligente
              </span>
            </div>
          </div>
          <EyeScene />
        </section>

        <section className="scan-panel section-tight" id="demo">
          <div className="wrap scan-shell">
            <div className="scan-copy">
              <span className="eyebrow">Demo gratuito</span>
              <h2>
                Escanea tus headers como SecurityHeaders, <span className="accent">pero con contexto Sentinel</span>.
              </h2>
              <p>
                Este diagnóstico público ejecuta checks pasivos o de bajo impacto: redirecciones, HTTPS, headers, SSL,
                DNS básico, robots.txt, sitemap.xml, score y recomendaciones accionables.
              </p>
              <form className="scan-form" onSubmit={(event) => void runScan(event)}>
                <label className="sr-only" htmlFor="scan-url">
                  URL para analizar
                </label>
                <input
                  id="scan-url"
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://example.com"
                  required
                  type="url"
                  value={url}
                />
                <button className="btn btn-primary" disabled={isScanning} type="submit">
                  <Terminal size={18} />
                  {isScanning ? 'Analizando' : 'Scan now'}
                </button>
              </form>
              <div className="scan-options">
                <label>
                  <input
                    checked={followRedirects}
                    onChange={(event) => setFollowRedirects(event.target.checked)}
                    type="checkbox"
                  />
                  Seguir redirecciones
                </label>
                <label>
                  <input
                    checked={hideFromPublicResults}
                    onChange={(event) => setHideFromPublicResults(event.target.checked)}
                    type="checkbox"
                  />
                  Ocultar de resultados públicos
                </label>
              </div>
              {error ? <div className="error-note">{error}</div> : null}
            </div>

            <div className="scan-result">
              <div className="scan-result-head">
                <div>
                  <div className="scan-result-title">Live public report</div>
                  <div className="scan-url">{scan?.finalUrl ?? 'Esperando diagnóstico'}</div>
                </div>
                <div className="grade">{scan?.grade ?? '--'}</div>
              </div>
              <div className="result-grid">
                <Metric label="Score" value={scan ? `${scan.score}/100` : '--'} />
                <Metric label="Risk" value={scan?.riskLevel ?? '--'} />
                <Metric label="HTTP" value={scan?.httpStatus ? `${scan.httpStatus}` : '--'} />
                <Metric label="Latency" value={scan?.metadata?.responseTimeMs ? `${scan.metadata.responseTimeMs}ms` : '--'} />
              </div>
              <div className="finding-list">
                {visibleFindings.map((finding) => (
                  <article className="finding" key={finding.id}>
                    <div className="finding-top">
                      <h4>{finding.title}</h4>
                      <span className="severity">{finding.severity}</span>
                    </div>
                    <p>{finding.recommendation}</p>
                  </article>
                ))}
                {scan && scan.findings.length === 0 ? (
                  <article className="finding">
                    <div className="finding-top">
                      <h4>No se detectaron hallazgos en el diagnóstico pasivo.</h4>
                      <span className="severity">ok</span>
                    </div>
                    <p>El resultado inicial luce saludable. Los scans avanzados requieren dominio verificado.</p>
                  </article>
                ) : null}
                {!scan ? (
                  <article className="finding">
                    <div className="finding-top">
                      <h4>El resultado aparecerá aquí</h4>
                      <span className="severity">demo</span>
                    </div>
                    <p>Obtendrás grade, score, headers, SSL, DNS, redirects y recomendaciones claras.</p>
                  </article>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="problema">
          <div className="wrap">
            <div className="center">
              <span className="eyebrow eyebrow-center">El riesgo invisible</span>
            </div>
            <h2 className="h-sec">
              Tu aplicación puede estar expuesta <span className="accent">aunque todo parezca funcionar</span>.
            </h2>
            <p className="sec-lead">
              Un header débil, una API pública, una sesión insegura o un flujo vulnerable pueden convertirse en la
              entrada perfecta para un incidente.
            </p>
            <div className="problem-grid">
              {problems.map((problem, index) => (
                <div className="prob" key={problem}>
                  <div className="num">{String(index + 1).padStart(2, '0')}</div>
                  <h4>{problem}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-tight" id="caracteristicas">
          <div className="wrap">
            <div className="center">
              <span className="eyebrow eyebrow-center">¿Qué es Sentinel?</span>
            </div>
            <h2 className="h-sec">
              Un agente IA que <span className="accent-blue">observa</span>, entiende y{' '}
              <span className="accent">actúa</span>.
            </h2>
            <p className="sec-lead">
              Sentinel combina monitoreo continuo, análisis inteligente, sandbox visual y automatización en un solo
              agente de defensa.
            </p>
            <div className="oar-grid">
              <OarCard icon={Eye} step="01 — VIGILA" title="Observa">
                Monitorea dominios, endpoints, eventos, errores, headers y señales de riesgo en tiempo real.
              </OarCard>
              <OarCard icon={BarChart3} step="02 — ANALIZA" title="Analiza">
                Interpreta patrones, clasifica amenazas y prioriza lo que realmente importa para tu negocio.
              </OarCard>
              <OarCard icon={Zap} step="03 — RESPONDE" title="Responde">
                Genera reportes claros, recomendaciones y flujos de mitigación defensiva.
              </OarCard>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="center">
              <span className="eyebrow eyebrow-center">Skills poderosas</span>
            </div>
            <h2 className="h-sec">
              Capacidades diseñadas para <span className="accent">defender productos reales</span>.
            </h2>
            <div className="skills-grid">
              {skills.map((skill) => (
                <div className="skill" key={skill}>
                  <span className="ic">
                    <Zap size={19} />
                  </span>
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="sandbox">
          <div className="wrap sandbox-wrap">
            <div className="sandbox-copy">
              <span className="eyebrow">Sandbox visual</span>
              <h2>
                Sentinel prueba tu app <span className="accent">como un atacante controlado</span>.
              </h2>
              <p>
                En fases profesionales, Sentinel interactuará con tu aplicación en un entorno aislado para observar
                formularios, consola, requests fallidas, cookies y evidencia visual sin poner en riesgo tu sistema real.
              </p>
              <ul className="sandbox-bullets">
                {[
                  'Pruebas visuales sobre aplicaciones reales verificadas',
                  'Simulación de navegación y análisis de formularios',
                  'Detección de flujos débiles y registro de evidencia',
                  'Reportes accionables con nivel de riesgo',
                ].map((item) => (
                  <li key={item}>
                    <Check size={18} /> {item}
                  </li>
                ))}
              </ul>
              <a className="btn btn-primary" href="#demo">
                Probar demo seguro
              </a>
            </div>
            <SandboxWindow />
          </div>
        </section>

        <section className="section" id="como">
          <div className="wrap">
            <div className="center">
              <span className="eyebrow eyebrow-center">Dashboard</span>
            </div>
            <h2 className="h-sec">
              Todo el estado de seguridad en <span className="accent-blue">una sola vista</span>.
            </h2>
            <DashboardPreview />
          </div>
        </section>

        <section className="section" id="soluciones">
          <div className="wrap">
            <div className="center">
              <span className="eyebrow eyebrow-center">Soluciones</span>
            </div>
            <h2 className="h-sec">
              Protección adaptada a <span className="accent">tu negocio</span>.
            </h2>
            <div className="sol-grid">
              {solutions.map(({ icon: Icon, text, title }) => (
                <div className="card sol" key={title}>
                  <div className="thumb">
                    <Icon size={42} />
                  </div>
                  <div className="sol-body">
                    <h3>{title}</h3>
                    <p>{text}</p>
              <a className="sol-link" href="/soluciones">
                      Ver solución <ChevronRight size={15} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-tight" id="recursos">
          <div className="wrap">
            <div className="center">
              <span className="eyebrow eyebrow-center">Confianza medible</span>
            </div>
            <h2 className="h-sec">
              Seguridad medible, <span className="accent">no promesas vacías</span>.
            </h2>
            <div className="metrics">
              <MetricBlock icon={Clock} label="Monitoreo continuo" sub="Sin interrupciones" value="24/7" />
              <MetricBlock icon={Zap} label="Clasificación inicial" sub="Ante eventos críticos" value="< 1s" />
              <MetricBlock icon={Globe} label="Disponibilidad objetivo" sub="Plataforma de monitoreo" value="99.9%" />
              <MetricBlock icon={Check} label="Checks automatizables" sub="Sobre apps y APIs" value="+500" />
            </div>
          </div>
        </section>

        <section className="section" id="precios">
          <div className="wrap">
            <div className="center">
              <span className="eyebrow eyebrow-center">Precios</span>
            </div>
            <h2 className="h-sec">
              Planes para proteger desde una <span className="accent-blue">app pequeña</span> hasta una{' '}
              <span className="accent">operación crítica</span>.
            </h2>
            <div className="price-grid">
              {plans.map((plan) => (
                <div className={`card price ${plan.featured ? 'featured' : ''}`} key={plan.plan}>
                  {plan.badge ? <span className="badge">{plan.badge}</span> : null}
                  <div className="plan">{plan.plan}</div>
                  <div className="desc">{plan.desc}</div>
                  <div className="amt">{plan.price}</div>
                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <Check size={15} /> {feature}
                      </li>
                    ))}
                  </ul>
                  <a className={plan.featured ? 'btn btn-primary' : 'btn btn-ghost'} href="/contacto">
                    {plan.featured ? 'Activar Business' : 'Solicitar información'}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-tight" id="contacto">
          <div className="wrap">
            <div className="cta-band">
              <div>
                <h2>
                  Deja que Sentinel vigile <span className="accent">antes de que el problema aparezca</span>.
                </h2>
                <p>
                  Agenda una demo y descubre cómo Sentinel puede analizar, probar y proteger tu aplicación con IA
                  defensiva.
                </p>
              </div>
              <div className="hero-cta" style={{ margin: 0 }}>
                <a className="btn btn-primary btn-lg" href="/contacto">
                  Solicitar demo
                </a>
                <a className="btn btn-ghost btn-lg" href="/precios">
                  Ver precios
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="result-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EyeScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animation = 0;
    let width = 0;
    let height = 0;
    let nodes: Array<{ red: boolean; r: number; vx: number; vy: number; x: number; y: number }> = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = Array.from({ length: 34 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.6 + 0.6,
        red: Math.random() < 0.18,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          if (!a || !b) continue;
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance < 110) {
            ctx.strokeStyle = `rgba(0,163,255,${(1 - distance / 110) * 0.16})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = node.red ? 'rgba(255,29,53,0.85)' : 'rgba(0,163,255,0.7)';
        ctx.shadowBlur = 8;
        ctx.shadowColor = node.red ? 'rgba(255,29,53,0.7)' : 'rgba(0,163,255,0.6)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animation = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="eye-scene">
      <canvas className="eye-canvas" ref={canvasRef} />
      <div className="eye-radar" />
      <svg aria-label="Ojo Sentinel" className="eye-svg" fill="none" viewBox="0 0 600 480" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient cx="50%" cy="50%" id="iris" r="50%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="14%" stopColor="#ffd0d6" />
            <stop offset="34%" stopColor="#FF1D35" />
            <stop offset="78%" stopColor="#9B0014" />
            <stop offset="100%" stopColor="#3a0008" />
          </radialGradient>
          <linearGradient id="lid" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#007BFF" />
            <stop offset="50%" stopColor="#00A3FF" />
            <stop offset="100%" stopColor="#007BFF" />
          </linearGradient>
          <filter height="220%" id="bglow" width="220%" x="-60%" y="-60%">
            <feGaussianBlur result="b" stdDeviation="6" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter height="340%" id="rglow" width="340%" x="-120%" y="-120%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        <path d="M40 240 Q300 70 560 240 Q300 410 40 240 Z" fill="rgba(0,163,255,0.04)" stroke="rgba(0,163,255,0.18)" />
        <g filter="url(#bglow)">
          <path d="M60 240 Q300 92 540 240" stroke="url(#lid)" strokeLinecap="round" strokeWidth="3.5" />
          <path d="M60 240 Q300 388 540 240" stroke="url(#lid)" strokeLinecap="round" strokeWidth="3.5" />
        </g>
        <path d="M96 240 Q300 120 504 240" stroke="rgba(0,163,255,0.35)" strokeWidth="1.2" />
        <path d="M96 240 Q300 360 504 240" stroke="rgba(0,163,255,0.35)" strokeWidth="1.2" />
        <circle cx="300" cy="240" fill="rgba(255,29,53,0.22)" filter="url(#rglow)" r="120" />
        <circle cx="300" cy="240" r="112" stroke="rgba(0,163,255,0.22)" />
        <circle cx="300" cy="240" r="100" stroke="rgba(255,29,53,0.25)" strokeDasharray="2 6" />
        <g className="iris-ticks">
          <circle cx="300" cy="240" r="92" stroke="rgba(0,163,255,0.35)" strokeDasharray="1 11" strokeWidth="1.5" />
        </g>
        <g className="iris-ticks-rev">
          <circle cx="300" cy="240" r="84" stroke="rgba(255,29,53,0.35)" strokeDasharray="3 26" strokeWidth="2" />
        </g>
        <g className="iris-core">
          <circle cx="300" cy="240" fill="url(#iris)" r="74" />
          <circle cx="300" cy="240" r="74" stroke="rgba(255,120,135,0.5)" />
          <circle cx="300" cy="240" r="46" stroke="rgba(255,255,255,0.25)" />
          <circle cx="300" cy="240" fill="#fff" r="20" />
          <circle cx="300" cy="240" fill="#fff" r="11" />
        </g>
        <circle cx="478" cy="168" fill="#FF1D35" r="4" />
        <circle cx="132" cy="300" fill="#00A3FF" r="3.5" />
        <circle cx="430" cy="328" fill="#FF1D35" r="3" />
      </svg>
    </div>
  );
}

function OarCard({
  children,
  icon: Icon,
  step,
  title,
}: {
  children: React.ReactNode;
  icon: typeof Eye;
  step: string;
  title: string;
}) {
  return (
    <div className="card oar">
      <div className="step">{step}</div>
      <div className="ic">
        <Icon size={26} />
      </div>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

function SandboxWindow() {
  return (
    <div className="win">
      <div className="win-bar">
        <div className="win-dots">
          <i style={{ background: '#FF1D35' }} />
          <i style={{ background: '#00A3FF' }} />
          <i style={{ background: '#28d17c' }} />
        </div>
        <div className="win-url">sandbox.sentinelcloud.dev/session/8f2a · aislado</div>
      </div>
      <div className="win-body">
        <div className="win-app">
          <div className="scanline" />
          <div className="ph m" />
          <div className="ph s" />
          <div className="field" />
          <div className="field" />
          <div className="ph s" style={{ marginTop: 18 }} />
          <span className="tag-detect">form detected</span>
        </div>
        <div className="win-panel">
          <div className="ph-title">Sentinel · live events</div>
          {[
            ['ok', 'Form detected', 'ok'],
            ['ok', 'Auth flow checked', 'ok'],
            ['warn', 'API response analyzed', '200'],
            ['bad', 'Suspicious redirect', '!'],
            ['warn', 'Risk score', 'medium'],
            ['ok', 'Recommendation generated', '→'],
          ].map(([state, label, result]) => (
            <div className="event" key={label}>
              <span className={`stat ${state}`} />
              {label}
              <span className="rs">{result}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="dash">
      <aside className="dash-side">
        <div className="brand" style={{ borderBottom: '1px solid var(--line)', marginBottom: 14, padding: '0 8px 22px' }}>
          <EyeLogo />
          <span className="brand-name" style={{ fontSize: 17 }}>
            Sentinel
          </span>
        </div>
        <ul className="dash-nav">
          {[
            [LayoutDashboard, 'Overview', true],
            [Boxes, 'Assets', false],
            [Monitor, 'Sandbox', false],
            [AlertTriangle, 'Alerts', false],
            [FileText, 'Reports', false],
            [Lock, 'Settings', false],
          ].map(([Icon, label, active]) => {
            const DashIcon = Icon as typeof LayoutDashboard;
            return (
              <li className={active ? 'active' : undefined} key={label as string}>
                <DashIcon size={16} /> {label as string}
              </li>
            );
          })}
        </ul>
      </aside>
      <div className="dash-main">
        <div className="dash-head">
          <h3>Security Overview</h3>
          <span className="pill">● Monitoreo activo</span>
        </div>
        <div className="dash-row">
          <div className="dash-card">
            <div className="ct">Risk Score</div>
            <svg height="120" viewBox="0 0 120 120" width="120">
              <circle cx="60" cy="60" fill="none" r="50" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
              <circle
                cx="60"
                cy="60"
                fill="none"
                r="50"
                stroke="#00A3FF"
                strokeDasharray="314"
                strokeDashoffset="86"
                strokeLinecap="round"
                strokeWidth="9"
                transform="rotate(-90 60 60)"
              />
              <text fill="#F5F7FA" fontFamily="Orbitron" fontSize="26" fontWeight="700" textAnchor="middle" x="60" y="58">
                72
              </text>
              <text fill="#8B94A7" fontFamily="Manrope" fontSize="9" textAnchor="middle" x="60" y="76">
                / 100 · Bajo
              </text>
            </svg>
          </div>
          <div className="dash-card">
            <div className="ct">Eventos últimos 7 días</div>
            <div className="bars">
              {[40, 62, 48, 88, 55, 70, 44].map((height, index) => (
                <i className={index === 3 ? 'hot' : undefined} key={height} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
          <div className="dash-card">
            <div className="ct">Alertas por severidad</div>
            <div className="alerts">
              <AlertLine level="hi" text="Redirect sospechoso · /pay" />
              <AlertLine level="md" text="Header inseguro · API v2" />
              <AlertLine level="md" text="Sesión sin expiración" />
              <AlertLine level="lo" text="Form sin rate-limit" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertLine({ level, text }: { level: 'hi' | 'lo' | 'md'; text: string }) {
  const label = level === 'hi' ? 'ALTA' : level === 'md' ? 'MEDIA' : 'BAJA';
  return (
    <div className="alert-i">
      <span className={`sev ${level}`}>{label}</span>
      {text}
    </div>
  );
}

function MetricBlock({
  icon: Icon,
  label,
  sub,
  value,
}: {
  icon: typeof Clock;
  label: string;
  sub: string;
  value: string;
}) {
  return (
    <div className="metric">
      <Icon color="var(--red)" size={26} />
      <div className="val">{value}</div>
      <div style={{ fontWeight: 800 }}>{label}</div>
      <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>{sub}</div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <a className="brand" href="#inicio">
              <EyeLogo />
              <span className="brand-name">Sentinel</span>
            </a>
            <div className="eyebrow" style={{ marginTop: 14 }}>
              AI-Powered Cyber Security
            </div>
            <p>Vigilancia inteligente para productos digitales. Protege lo que más importa.</p>
          </div>
          <FooterColumn
            items={[
              ['Características', '/caracteristicas'],
              ['Sandbox Visual', '/sandbox'],
              ['Precios', '/precios'],
              ['Dashboard', '/#como'],
              ['Seguridad', '/caracteristicas'],
            ]}
            title="Producto"
          />
          <FooterColumn
            items={[
              ['Blog', '/recursos'],
              ['Casos de uso', '/recursos'],
              ['Documentación', '/recursos'],
              ['Centro de ayuda', '/recursos'],
            ]}
            title="Recursos"
          />
          <div>
            <h4>Contacto</h4>
            <ul>
              <li>hola@sentinelcloud.dev</li>
              <li>Bogotá, Colombia</li>
              <li>sentinelcloud.dev</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Sentinel Cloud. Todos los derechos reservados.</span>
          <span>Uso autorizado · Seguridad defensiva · Bajo impacto</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ items, title }: { items: Array<[string, string]>; title: string }) {
  return (
    <div>
      <h4>{title}</h4>
      <ul>
        {items.map(([item, href]) => (
          <li key={item}>
            <a href={href}>{item}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
