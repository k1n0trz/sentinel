'use client';

import type { RawHeader, ScanResult, SecurityHeaderResult } from '@sentinel/shared';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Globe2,
  Lock,
  Radar,
  ShieldCheck,
  Terminal,
  XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { runFreeScan } from '../lib/api';
import { SiteFooter, SiteHeader } from './site-shell';

const headerDescriptions: Record<string, { text: string; value: string }> = {
  'Content-Security-Policy': {
    text: 'Ayuda a reducir XSS y carga de recursos no autorizados declarando origenes permitidos.',
    value: "Recomendado: definir default-src, script-src, object-src 'none' y frame-ancestors.",
  },
  'Strict-Transport-Security': {
    text: 'Indica al navegador que use HTTPS para futuras visitas al host.',
    value: 'Recomendado: max-age amplio, includeSubDomains si todos los subdominios soportan HTTPS.',
  },
  'X-Frame-Options': {
    text: 'Reduce riesgo de clickjacking al limitar si la pagina puede ser embebida en frames.',
    value: 'Recomendado: DENY o SAMEORIGIN, o frame-ancestors en CSP.',
  },
  'X-Content-Type-Options': {
    text: 'Evita que el navegador intente adivinar MIME types distintos al declarado.',
    value: 'Recomendado: nosniff.',
  },
  'Referrer-Policy': {
    text: 'Controla cuanta informacion de URL se comparte al navegar hacia otros origenes.',
    value: 'Recomendado: strict-origin-when-cross-origin o mas estricto.',
  },
  'Permissions-Policy': {
    text: 'Limita capacidades sensibles del navegador como camara, microfono o geolocalizacion.',
    value: 'Recomendado: deshabilitar o acotar features que la app no usa.',
  },
  'Cross-Origin-Embedder-Policy': {
    text: 'Permite exigir recursos compatibles con aislamiento cross-origin.',
    value: 'Recomendado solo si la app necesita aislamiento y sus dependencias lo soportan.',
  },
  'Cross-Origin-Opener-Policy': {
    text: 'Aisla ventanas y reduce interacciones no deseadas entre contextos de navegacion.',
    value: 'Recomendado: same-origin cuando sea compatible con el producto.',
  },
  'Cross-Origin-Resource-Policy': {
    text: 'Declara si un recurso puede cargarse desde otros origenes.',
    value: 'Recomendado: same-origin, same-site o cross-origin segun el modelo de recursos.',
  },
};

const upcomingHeaderNames = [
  'Cross-Origin-Embedder-Policy',
  'Cross-Origin-Opener-Policy',
  'Cross-Origin-Resource-Policy',
];

const statusLabels: Record<SecurityHeaderResult['status'], string> = {
  present: 'presente',
  missing: 'faltante',
  weak: 'débil',
  misconfigured: 'mal configurado',
};

const formatReportTime = (value?: string) => {
  if (!value) return '-';

  return `${new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(value))} UTC`;
};

const firstAddress = (scan: ScanResult | null) => scan?.dns?.addresses[0] ?? '-';

const importantHeadersFirst = (headers: RawHeader[]) =>
  headers.slice().sort((left, right) => {
    const leftSecurity = Object.prototype.hasOwnProperty.call(headerDescriptions, left.name);
    const rightSecurity = Object.prototype.hasOwnProperty.call(headerDescriptions, right.name);

    if (leftSecurity === rightSecurity) return left.name.localeCompare(right.name);
    return leftSecurity ? -1 : 1;
  });

export function DiagnosticPage() {
  const [url, setUrl] = useState('example.com');
  const [followRedirects, setFollowRedirects] = useState(true);
  const [hideFromPublicResults, setHideFromPublicResults] = useState(false);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const autoScanStarted = useRef(false);

  const executeScan = async (target: string, follow: boolean, hide: boolean) => {
    setError(null);
    setIsScanning(true);

    try {
      setScan(await runFreeScan({ followRedirects: follow, hideFromPublicResults: hide, url: target }));
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : 'No se pudo ejecutar el diagnóstico.');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (autoScanStarted.current) return;

    const params = new URLSearchParams(window.location.search);
    const target = params.get('target');

    if (!target) return;

    const follow = params.get('followRedirects') !== 'false';
    const hide = params.get('hideFromPublicResults') === 'true';

    autoScanStarted.current = true;
    setUrl(target);
    setFollowRedirects(follow);
    setHideFromPublicResults(hide);
    void executeScan(target, follow, hide);
  }, []);

  const onScan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void executeScan(url, followRedirects, hideFromPublicResults);
  };

  return (
    <>
      <SiteHeader />
      <main className="diagnostic-page">
        <section className="diagnostic-hero wrap">
          <div className="diagnostic-copy">
            <span className="eyebrow">Diagnóstico público</span>
            <h1>
              Escanea headers, SSL, DNS y redirecciones con <span className="accent">contexto Sentinel</span>.
            </h1>
            <p>
              Este diagnóstico ejecuta checks pasivos de bajo impacto sobre dominios públicos. Para pruebas profundas,
              Sentinel exigirá verificación de propiedad del dominio.
            </p>
          </div>

          <form className="diagnostic-form" onSubmit={onScan}>
            <label htmlFor="diagnostic-url">Dominio o URL</label>
            <div className="diagnostic-input-row">
              <input
                id="diagnostic-url"
                inputMode="url"
                onChange={(event) => setUrl(event.target.value)}
                placeholder="example.com"
                required
                type="text"
                value={url}
              />
              <button className="btn btn-primary" disabled={isScanning} type="submit">
                <Terminal size={18} />
                {isScanning ? 'Analizando' : 'Scan now'}
              </button>
            </div>
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
          </form>
        </section>

        <DiagnosticReport scan={scan} />
      </main>
      <SiteFooter />
    </>
  );
}

export function DiagnosticReport({ scan }: { scan: ScanResult | null }) {
  const missingHeaders = scan?.headers.filter((header) => header.status === 'missing') ?? [];
  const attentionHeaders = scan?.headers.filter((header) => header.status === 'weak' || header.status === 'misconfigured') ?? [];
  const presentHeaders = scan?.headers.filter((header) => header.present) ?? [];
  const rawHeaders = importantHeadersFirst(scan?.metadata?.rawHeaders ?? []);
  const upcomingHeaders = (scan?.headers ?? []).filter((header) => upcomingHeaderNames.includes(header.name));

  return (
    <section className="wrap diagnostic-report">
      <ReportSummary scan={scan} />

      {scan ? (
        <>
          <ReportSection title="Headers faltantes">
            {missingHeaders.length > 0 ? (
              <HeaderExplanationList headers={missingHeaders} />
            ) : (
              <EmptyReportLine text="No se detectaron headers críticos faltantes en este diagnóstico pasivo." />
            )}
          </ReportSection>

          <ReportSection title="Headers débiles o mal configurados">
            {attentionHeaders.length > 0 ? (
              <HeaderExplanationList headers={attentionHeaders} />
            ) : (
              <EmptyReportLine text="Los headers presentes no mostraron debilidades evidentes según las reglas actuales." />
            )}
          </ReportSection>

          <ReportSection title="Raw headers">
            {rawHeaders.length > 0 ? (
              <RawHeadersTable headers={rawHeaders} httpStatus={scan.httpStatus} />
            ) : (
              <EmptyReportLine text="No se recibieron headers HTTP del target." />
            )}
          </ReportSection>

          <ReportSection title="Upcoming headers">
            <HeaderExplanationList headers={upcomingHeaders} />
          </ReportSection>

          <ReportSection title="Información adicional">
            <AdditionalInfo scan={scan} headers={presentHeaders} />
          </ReportSection>
        </>
      ) : (
        <div className="diagnostic-empty">
          <Radar size={34} />
          <h2>Ejecuta un diagnóstico para generar el reporte.</h2>
          <p>Verás grade, score, IP, headers detectados, faltantes, raw headers, DNS, SSL y recomendaciones.</p>
        </div>
      )}
    </section>
  );
}

function ReportSummary({ scan }: { scan: ScanResult | null }) {
  return (
    <section className="diagnostic-card summary-card">
      <div className="diagnostic-card-title">
        <ShieldCheck size={20} />
        <h2>Security Report Summary</h2>
      </div>
      <div className="summary-grid">
        <div className={`summary-grade ${scan ? `grade-${scan.grade.replace('+', 'plus').toLowerCase()}` : ''}`}>
          {scan?.grade ?? '-'}
        </div>
        <div className="summary-details">
          <SummaryRow label="Site" value={scan?.finalUrl ?? '-'} />
          <SummaryRow label="IP Address" value={firstAddress(scan)} />
          <SummaryRow label="Report Time" value={formatReportTime(scan?.createdAt)} />
          <SummaryRow
            label="Headers"
            valueNode={
              <div className="header-chip-row">
                {scan?.headers.length ? (
                  scan.headers.map((header) => <HeaderChip header={header} key={header.name} />)
                ) : (
                  <span className="muted">Sin diagnóstico</span>
                )}
              </div>
            }
          />
          <SummaryRow
            label="Advanced"
            valueNode={
              <div className="advanced-row">
                <span>
                  {scan ? 'Not bad. Para análisis profundo de APIs, formularios y flujos, verifica el dominio.' : 'Disponible después del scan público.'}
                </span>
                <div className="advanced-actions">
                  {scan ? (
                    <a className="btn btn-ghost btn-sm" href={`/diagnostico/report/${scan.id}`}>
                      Ver reporte
                    </a>
                  ) : null}
                  <a className="btn btn-primary btn-sm" href="/contacto">
                    Try Now
                  </a>
                </div>
              </div>
            }
          />
        </div>
      </div>
      <div className="summary-metrics">
        <Metric icon={Database} label="Score" value={scan ? `${scan.score}/100` : '-'} />
        <Metric icon={AlertTriangle} label="Risk" value={scan?.riskLevel ?? '-'} />
        <Metric icon={Globe2} label="HTTP" value={scan?.httpStatus ? `${scan.httpStatus}` : '-'} />
        <Metric icon={Clock} label="Latency" value={scan?.metadata?.responseTimeMs ? `${scan.metadata.responseTimeMs}ms` : '-'} />
      </div>
    </section>
  );
}

function ReportSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="diagnostic-card report-section">
      <div className="diagnostic-card-title">
        <Lock size={20} />
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SummaryRow({
  label,
  value,
  valueNode,
}: {
  label: string;
  value?: string;
  valueNode?: React.ReactNode;
}) {
  return (
    <div className="summary-row">
      <strong>{label}:</strong>
      <div>{valueNode ?? value}</div>
    </div>
  );
}

function HeaderChip({ header }: { header: SecurityHeaderResult }) {
  const Icon = header.status === 'present' ? CheckCircle2 : XCircle;

  return (
    <span className={`header-chip ${header.status}`}>
      <Icon size={13} />
      {header.name}
    </span>
  );
}

function HeaderExplanationList({ headers }: { headers: SecurityHeaderResult[] }) {
  if (headers.length === 0) {
    return <EmptyReportLine text="No hay elementos para mostrar." />;
  }

  return (
    <div className="report-lines">
      {headers.map((header) => {
        const description = headerDescriptions[header.name];

        return (
          <article className="report-line" key={header.name}>
            <strong className={header.status === 'present' ? 'good' : 'bad'}>{header.name}</strong>
            <div>
              <p>
                <a href={`https://developer.mozilla.org/search?q=${encodeURIComponent(header.name)}`} rel="noreferrer" target="_blank">
                  {header.name}
                </a>{' '}
                {description?.text ?? header.risk ?? `Estado: ${statusLabels[header.status]}.`}
              </p>
              <p className="muted">{header.recommendation ?? description?.value}</p>
              {header.value ? <code>{header.value}</code> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function RawHeadersTable({ headers, httpStatus }: { headers: RawHeader[]; httpStatus?: number }) {
  return (
    <div className="raw-table">
      <div className="raw-row raw-head">
        <strong>HTTP</strong>
        <span>{httpStatus ?? '-'}</span>
      </div>
      {headers.map((header) => (
        <div className="raw-row" key={`${header.name}-${header.value}`}>
          <strong className={Object.prototype.hasOwnProperty.call(headerDescriptions, header.name) ? 'good' : undefined}>
            {header.name}
          </strong>
          <span>{header.value}</span>
        </div>
      ))}
    </div>
  );
}

function AdditionalInfo({ headers, scan }: { headers: SecurityHeaderResult[]; scan: ScanResult }) {
  const redirectCount = scan.metadata?.redirectChain.length ?? 0;

  return (
    <div className="report-lines">
      {headers.slice(0, 8).map((header) => (
        <article className="report-line" key={header.name}>
          <strong className="good">{header.name}</strong>
          <div>
            <p>{headerDescriptions[header.name]?.text ?? 'Header detectado durante el diagnóstico pasivo.'}</p>
            <p className="muted">{headerDescriptions[header.name]?.value}</p>
          </div>
        </article>
      ))}
      <article className="report-line">
        <strong>DNS</strong>
        <div>
          <p>{scan.dns?.addresses.length ? `${scan.dns.addresses.length} A record(s): ${scan.dns.addresses.join(', ')}` : 'No se resolvieron registros A.'}</p>
          <p className="muted">NS: {scan.dns?.ns.length ? scan.dns.ns.join(', ') : 'no detectados'}.</p>
        </div>
      </article>
      <article className="report-line">
        <strong>SSL</strong>
        <div>
          <p>{scan.ssl?.enabled ? 'TLS/SSL detectado en el destino final.' : 'El destino final no usa HTTPS.'}</p>
          <p className="muted">
            {typeof scan.ssl?.daysRemaining === 'number'
              ? `El certificado tiene ${scan.ssl.daysRemaining} día(s) restantes.`
              : 'La metadata del certificado no estuvo disponible.'}
          </p>
        </div>
      </article>
      <article className="report-line">
        <strong>Redirects</strong>
        <div>
          <p>{redirectCount ? `${redirectCount} salto(s) de redireccion detectados.` : 'No se detectaron redirecciones.'}</p>
          <p className="muted">
            Robots: {scan.metadata?.robotsTxt?.present ? 'detectado' : 'no detectado'} · Sitemap:{' '}
            {scan.metadata?.sitemapXml?.present ? 'detectado' : 'no detectado'}.
          </p>
        </div>
      </article>
    </div>
  );
}

function EmptyReportLine({ text }: { text: string }) {
  return <p className="empty-line">{text}</p>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof Database; label: string; value: string }) {
  return (
    <div className="diagnostic-metric">
      <Icon size={17} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
