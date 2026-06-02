import type { ScanResult, Severity } from '@sentinel/shared';

export type ScanReportSummary = {
  score: number;
  grade: ScanResult['grade'];
  riskLevel: ScanResult['riskLevel'];
  responseTimeMs?: number;
  redirectHops: number;
  findingsBySeverity: Partial<Record<Severity, number>>;
};

export const summarizeScan = (scan: ScanResult): ScanReportSummary => {
  const summary: ScanReportSummary = {
    score: scan.score,
    grade: scan.grade,
    riskLevel: scan.riskLevel,
    redirectHops: scan.metadata?.redirectChain.length ?? 0,
    findingsBySeverity: scan.findings.reduce<Partial<Record<Severity, number>>>((acc, finding) => {
      acc[finding.severity] = (acc[finding.severity] ?? 0) + 1;
      return acc;
    }, {}),
  };

  if (typeof scan.metadata?.responseTimeMs === 'number') {
    summary.responseTimeMs = scan.metadata.responseTimeMs;
  }

  return summary;
};
