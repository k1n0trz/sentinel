import type {
  Finding,
  ScanReportSummary,
  ScanResult,
  Severity,
} from '@sentinel/shared';

const severityPriority: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

type ReportFindingHighlight = Pick<
  Finding,
  'title' | 'severity' | 'category' | 'recommendation'
>;

const formatFindingCount = (count: number) =>
  count === 1 ? 'se detectó 1 hallazgo' : `se detectaron ${count} hallazgos`;

export const summarizeScan = (scan: ScanResult): ScanReportSummary => {
  const redirectHops = scan.metadata?.redirectChain.length ?? 0;
  const orderedFindings = [...scan.findings].sort(
    (left, right) =>
      severityPriority[left.severity] - severityPriority[right.severity],
  );
  const topFindings = orderedFindings
    .slice(0, 5)
    .map<ReportFindingHighlight>(
      ({ title, severity, category, recommendation }) => ({
        title,
        severity,
        category,
        recommendation,
      }),
    );
  const highestSeverity = orderedFindings[0]?.severity;
  const affectedCategories = Array.from(
    new Set(orderedFindings.map((finding) => finding.category)),
  ).slice(0, 5);
  const responseTime = scan.metadata?.responseTimeMs;
  const summary: ScanReportSummary = {
    score: scan.score,
    grade: scan.grade,
    riskLevel: scan.riskLevel,
    redirectHops,
    totalFindings: scan.findings.length,
    findingsBySeverity: scan.findings.reduce<Partial<Record<Severity, number>>>(
      (acc, finding) => {
        acc[finding.severity] = (acc[finding.severity] ?? 0) + 1;
        return acc;
      },
      {},
    ),
    topFindings,
    executiveSummary:
      scan.findings.length === 0
        ? `Sentinel calificó este objetivo con grado ${scan.grade} (${scan.score}/100) y nivel ${scan.riskLevel}; no se detectaron hallazgos en la revisión pasiva pública.`
        : `Sentinel calificó este objetivo con grado ${scan.grade} (${scan.score}/100) y nivel ${scan.riskLevel}; ${formatFindingCount(scan.findings.length)}, con severidad máxima ${highestSeverity}.`,
    technicalSummary:
      [
        `HTTP ${scan.httpStatus ?? 'sin respuesta'}`,
        `HTTPS ${scan.https ? 'activo' : 'no confirmado'}`,
        `Redirecciones: ${redirectHops}`,
        typeof responseTime === 'number'
          ? `Tiempo de respuesta: ${responseTime} ms`
          : 'Tiempo de respuesta: no disponible',
        `Categorías afectadas: ${affectedCategories.length > 0 ? affectedCategories.join(', ') : 'sin categorias afectadas'}`,
      ].join('. ') + '.',
    recommendedNextActions:
      topFindings.length > 0
        ? topFindings.map((finding) => {
            const action =
              finding.severity === 'critical' || finding.severity === 'high'
                ? 'Priorizar'
                : finding.severity === 'medium'
                  ? 'Corregir'
                  : 'Revisar';

            return `${action} ${finding.title}: ${finding.recommendation}`;
          })
        : [
            'Mantener monitoreo continuo de cabeceras, TLS, DNS y redirecciones después de cada despliegue.',
          ],
  };

  if (typeof responseTime === 'number') {
    summary.responseTimeMs = responseTime;
  }

  if (highestSeverity) {
    summary.highestSeverity = highestSeverity;
  }

  return summary;
};
