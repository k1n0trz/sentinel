import {
  Activity,
  AlertTriangle,
  Bell,
  Boxes,
  Code2,
  FileText,
  Globe2,
  LayoutDashboard,
  Lock,
  PlugZap,
  Radar,
  ScanLine,
  ShieldCheck,
  ShoppingBag,
  Workflow,
} from 'lucide-react';
import { PrivateScanHistory } from './private-scan-history';
import { SignOutButton } from './sign-out-button';

export type ProfessionalAppView = 'domains' | 'integrations' | 'overview' | 'projects' | 'reports' | 'scans';

const navItems: Array<[ProfessionalAppView, string, string, typeof LayoutDashboard]> = [
  ['overview', 'Overview', '/app', LayoutDashboard],
  ['projects', 'Proyectos', '/app/proyectos', Boxes],
  ['domains', 'Dominios', '/app/dominios', Globe2],
  ['scans', 'Scans', '/app/scans', ScanLine],
  ['reports', 'Reportes', '/app/reportes', FileText],
  ['integrations', 'Integraciones', '/app/integraciones', PlugZap],
];

const projects = [
  {
    name: 'Tienda principal',
    plan: 'Business',
    domains: 3,
    score: 82,
    status: 'Monitoreo diario',
  },
  {
    name: 'SaaS clientes',
    plan: 'Pro',
    domains: 7,
    score: 76,
    status: 'Sandbox activo',
  },
  {
    name: 'Landing campañas',
    plan: 'Starter',
    domains: 1,
    score: 91,
    status: 'Semanal',
  },
];

const domains = [
  ['sentinelcloud.dev', 'Verificado', 'A', 'Headers fuertes', 'Hace 12 min'],
  ['app.sentinelcloud.dev', 'Pendiente DNS TXT', 'B', 'Falta HSTS preload', 'Hace 1 h'],
  ['checkout-demo.com', 'Verificado', 'C', 'CSP debil', 'Ayer'],
  ['woocommerce-client.com', 'Verificado', 'B', 'XML-RPC expuesto', 'Ayer'],
] as const;

const integrations = [
  ['WordPress', 'Business+', 'REST API, XML-RPC, plugins visibles y hardening base', ShieldCheck],
  ['WooCommerce', 'Business+', 'Checkout, cookies, scripts externos y señales ecommerce', ShoppingBag],
  ['Shopify', 'Business+', 'Theme risk, scripts, redirects y dominios conectados', ShoppingBag],
  ['GitHub', 'Pro+', 'Repos autorizados, lockfiles, workflows y supply chain', Code2],
  ['Cloudflare', 'Starter+', 'Headers, reglas sugeridas, DNS y edge posture', Workflow],
  ['Vercel', 'Starter+', 'Headers, preview exposure y configuracion de despliegue', Radar],
] as const;

export function ProfessionalAppPage({ view }: { view: ProfessionalAppView }) {
  return (
    <main className="app-shell">
      <aside className="app-sidebar">
        <a className="app-brand" href="/">
          <span className="app-brand-eye" />
          <span>Sentinel</span>
        </a>
        <nav className="app-nav" aria-label="Navegacion app">
          {navItems.map(([id, label, href, Icon]) => (
            <a className={view === id ? 'active' : undefined} href={href} key={id}>
              <Icon size={17} />
              {label}
            </a>
          ))}
        </nav>
        <div className="app-plan">
          <span>Plan actual</span>
          <strong>Business</strong>
          <p>3 dominios · sandbox básico · alertas email</p>
        </div>
      </aside>

      <section className="app-main">
        <header className="app-topbar">
          <div>
            <span className="app-kicker">app.sentinelcloud.dev</span>
            <h1>{viewTitles[view]}</h1>
          </div>
          <div className="app-actions">
            <a className="btn btn-ghost btn-sm" href="/diagnostico">
              Demo publico
            </a>
            <a className="btn btn-primary btn-sm" href="/app/dominios">
              Agregar dominio
            </a>
            <SignOutButton />
          </div>
        </header>

        {view === 'overview' ? <OverviewView /> : null}
        {view === 'projects' ? <ProjectsView /> : null}
        {view === 'domains' ? <DomainsView /> : null}
        {view === 'scans' ? <ScansView /> : null}
        {view === 'reports' ? <ReportsView /> : null}
        {view === 'integrations' ? <IntegrationsView /> : null}
      </section>
    </main>
  );
}

const viewTitles: Record<ProfessionalAppView, string> = {
  overview: 'Security Overview',
  projects: 'Proyectos',
  domains: 'Dominios verificados',
  scans: 'Scans profesionales',
  reports: 'Reportes',
  integrations: 'Integraciones',
};

function OverviewView() {
  return (
    <>
      <section className="app-metrics">
        <AppMetric icon={ShieldCheck} label="Score promedio" tone="blue" value="83/100" />
        <AppMetric icon={Globe2} label="Dominios" tone="green" value="11" />
        <AppMetric icon={AlertTriangle} label="Riesgos abiertos" tone="red" value="7" />
        <AppMetric icon={Bell} label="Alertas 7 dias" tone="yellow" value="4" />
      </section>
      <section className="app-grid app-grid-2">
        <Panel title="Prioridad de hoy">
          <div className="app-alert-list">
            <AlertLine severity="high" text="CSP debil en checkout-demo.com" />
            <AlertLine severity="medium" text="app.sentinelcloud.dev requiere verificacion DNS TXT" />
            <AlertLine severity="low" text="robots.txt no detectado en landing de campañas" />
          </div>
        </Panel>
        <Panel title="Actividad reciente">
          <TimelineItem icon={ScanLine} text="Scan publico convertido en reporte compartible" />
          <TimelineItem icon={Activity} text="Sandbox visual programado para checkout-demo.com" />
          <TimelineItem icon={Lock} text="Dominio sentinelcloud.dev verificado" />
        </Panel>
      </section>
      <ProjectsView compact />
    </>
  );
}

function ProjectsView({ compact = false }: { compact?: boolean }) {
  return (
    <Panel title={compact ? 'Proyectos activos' : 'Proyectos'}>
      <div className="app-table">
        <div className="app-table-row head">
          <span>Proyecto</span>
          <span>Plan</span>
          <span>Dominios</span>
          <span>Score</span>
          <span>Estado</span>
        </div>
        {projects.map((project) => (
          <div className="app-table-row" key={project.name}>
            <strong>{project.name}</strong>
            <span>{project.plan}</span>
            <span>{project.domains}</span>
            <span>{project.score}/100</span>
            <span>{project.status}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DomainsView() {
  return (
    <Panel title="Dominios y verificacion">
      <div className="app-table">
        <div className="app-table-row head">
          <span>Dominio</span>
          <span>Verificacion</span>
          <span>Grade</span>
          <span>Hallazgo principal</span>
          <span>Ultimo scan</span>
        </div>
        {domains.map(([domain, status, grade, finding, lastScan]) => (
          <div className="app-table-row" key={domain}>
            <strong>{domain}</strong>
            <span>{status}</span>
            <span>{grade}</span>
            <span>{finding}</span>
            <span>{lastScan}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ScansView() {
  return (
    <Panel title="Historial de scans">
      <PrivateScanHistory />
    </Panel>
  );
}

function ReportsView() {
  return (
    <section className="app-grid app-grid-3">
      {['Auditoria express', 'Ecommerce posture', 'Web + API report'].map((report, index) => (
        <div className="app-card report-card" key={report}>
          <FileText size={22} />
          <h3>{report}</h3>
          <p>{index === 0 ? 'Resumen ejecutivo y tecnico para cliente.' : index === 1 ? 'Checklist para checkout, SSL, headers, cookies y scripts.' : 'Superficie web, APIs visibles, DNS y sandbox.'}</p>
          <a href="/diagnostico">Generar desde scan</a>
        </div>
      ))}
    </section>
  );
}

function IntegrationsView() {
  return (
    <section className="app-grid app-grid-3">
      {integrations.map(([name, plan, description, Icon]) => (
        <div className="app-card integration-card" key={name}>
          <div className="integration-head">
            <Icon size={24} />
            <span>{plan}</span>
          </div>
          <h3>{name}</h3>
          <p>{description}</p>
          <button type="button">Preparar integracion</button>
        </div>
      ))}
    </section>
  );
}

function Panel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="app-panel">
      <div className="app-panel-head">
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function AppMetric({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  tone: 'blue' | 'green' | 'red' | 'yellow';
  value: string;
}) {
  return (
    <div className={`app-metric ${tone}`}>
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AlertLine({ severity, text }: { severity: 'high' | 'low' | 'medium'; text: string }) {
  return (
    <div className="app-alert-line">
      <span className={`app-severity ${severity}`}>{severity}</span>
      <p>{text}</p>
    </div>
  );
}

function TimelineItem({ icon: Icon, text }: { icon: typeof ScanLine; text: string }) {
  return (
    <div className="app-timeline-item">
      <Icon size={16} />
      <span>{text}</span>
    </div>
  );
}
