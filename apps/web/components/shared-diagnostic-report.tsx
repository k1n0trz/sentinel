'use client';

import type { PublicReport } from '@sentinel/shared';
import { ClipboardCheck, FileText, ScanLine } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPublicReport } from '../lib/api';
import { DiagnosticReport } from './diagnostic-page';
import { SiteFooter, SiteHeader } from './site-shell';

const formatReportDate = (value?: string) => {
  if (!value) return '--';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
};

const formatFindingTotal = (count: number) =>
  `${count} ${count === 1 ? 'hallazgo' : 'hallazgos'}`;

export function SharedDiagnosticReport({ scanId }: { scanId: string }) {
  const [report, setReport] = useState<PublicReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scan = report?.scan ?? null;

  useEffect(() => {
    let active = true;

    const loadScan = async () => {
      try {
        const result = await getPublicReport(scanId);
        if (active) setReport(result);
      } catch (loadError) {
        if (active)
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'No se pudo cargar el reporte.',
          );
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadScan();

    return () => {
      active = false;
    };
  }, [scanId]);

  return (
    <>
      <SiteHeader />
      <main className="diagnostic-page shared-report-page">
        <section className="diagnostic-hero wrap">
          <div className="diagnostic-copy">
            <span className="eyebrow">Reporte compartible</span>
            <h1>
              Diagnóstico Sentinel <span className="accent">guardado</span>.
            </h1>
            <p>
              Este reporte se carga por ID desde el endpoint público. No existe
              listado público de resultados ni ranking de dominios escaneados.
            </p>
          </div>
          <div className="diagnostic-form shared-report-status">
            <label>Estado</label>
            <strong>
              {isLoading
                ? 'Cargando reporte'
                : report
                  ? `Grado ${report.summary.grade}`
                  : 'Reporte no encontrado'}
            </strong>
            {report ? (
              <span className="shared-report-status-meta">
                {report.summary.riskLevel} ·{' '}
                {formatFindingTotal(report.summary.totalFindings)} ·{' '}
                {report.summary.score}/100
              </span>
            ) : null}
            {error ? <div className="error-note">{error}</div> : null}
            <a className="btn btn-primary" href="/diagnostico">
              <ScanLine size={16} aria-hidden="true" />
              Nuevo diagnóstico
            </a>
          </div>
        </section>
        <ProfessionalReportOverview
          report={report}
          isLoading={isLoading}
          error={error}
          scanId={scanId}
        />
        <DiagnosticReport scan={scan} />
      </main>
      <SiteFooter />
    </>
  );
}

function ProfessionalReportOverview({
  report,
  isLoading,
  error,
  scanId,
}: {
  report: PublicReport | null;
  isLoading: boolean;
  error: string | null;
  scanId: string;
}) {
  const summary = report?.summary;
  const scan = report?.scan;
  const actions = summary?.recommendedNextActions ?? [
    isLoading
      ? 'Cargando prioridades del reporte.'
      : 'Verifica el enlace compartido o genera un nuevo diagnóstico público.',
  ];

  return (
    <section
      className="wrap professional-report-overview"
      aria-label="Resumen ejecutivo del reporte"
    >
      <article className="diagnostic-card report-brief-card">
        <div className="diagnostic-card-title">
          <FileText size={20} aria-hidden="true" />
          <h2>Resumen ejecutivo</h2>
        </div>
        <div className="executive-report-body">
          <p className="executive-summary-text">
            {summary?.executiveSummary ??
              (isLoading
                ? 'Cargando lectura ejecutiva del diagnóstico.'
                : 'No se pudo cargar el resumen ejecutivo para este reporte.')}
          </p>
          {summary ? (
            <p className="technical-summary-text">{summary.technicalSummary}</p>
          ) : null}
          {error ? <div className="error-note">{error}</div> : null}
          <div
            className="report-meta-grid"
            aria-label="Indicadores principales"
          >
            <div className="report-meta-item">
              <span>Scan ID</span>
              <strong>{scanId}</strong>
            </div>
            <div className="report-meta-item">
              <span>Objetivo</span>
              <strong>{scan?.finalUrl ?? scan?.targetUrl ?? '--'}</strong>
            </div>
            <div className="report-meta-item">
              <span>Fecha</span>
              <strong>{formatReportDate(scan?.createdAt)}</strong>
            </div>
            <div className="report-meta-item">
              <span>Severidad máxima</span>
              <strong>{summary?.highestSeverity ?? 'sin hallazgos'}</strong>
            </div>
          </div>
        </div>
      </article>

      <article className="diagnostic-card report-priority-card">
        <div className="diagnostic-card-title">
          <ClipboardCheck size={20} aria-hidden="true" />
          <h2>Prioridades recomendadas</h2>
        </div>
        <ol className="report-action-list">
          {actions.map((action) => (
            <li key={action}>
              <span>{action}</span>
            </li>
          ))}
        </ol>
        {summary?.topFindings.length ? (
          <div className="report-finding-list">
            <span>Hallazgos principales</span>
            {summary.topFindings.map((finding) => (
              <p key={`${finding.severity}-${finding.title}`}>
                <strong>{finding.severity}</strong> {finding.title}
              </p>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}
