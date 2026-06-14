import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ScanResult } from '@sentinel/shared';
import { summarizeScan } from './scan-report-summary.js';

const baseScan: ScanResult = {
  id: 'scan_summary_test',
  targetUrl: 'https://example.com/',
  finalUrl: 'https://www.example.com/',
  status: 'completed',
  httpStatus: 200,
  https: true,
  score: 62,
  grade: 'D',
  riskLevel: 'Warning',
  headers: [],
  findings: [],
  metadata: {
    responseTimeMs: 420,
    redirectChain: [
      {
        from: 'https://example.com/',
        to: 'https://www.example.com/',
        status: 301,
      },
    ],
    rawHeaders: [],
  },
  createdAt: '2026-06-13T00:00:00.000Z',
};

describe('summarizeScan', () => {
  it('builds an executive report summary with prioritized findings and next actions', () => {
    const summary = summarizeScan({
      ...baseScan,
      findings: [
        {
          id: 'low-cache',
          title: 'Cache policy can expose stale content',
          severity: 'low',
          category: 'security-headers',
          description: 'Cache headers are permissive.',
          recommendation: 'Tighten cache headers on authenticated surfaces.',
        },
        {
          id: 'high-csp',
          title: 'Missing Content-Security-Policy',
          severity: 'high',
          category: 'security-headers',
          description: 'CSP is missing.',
          recommendation: 'Add a tested CSP.',
        },
        {
          id: 'medium-hsts',
          title: 'Strict-Transport-Security max-age is too low',
          severity: 'medium',
          category: 'transport-security',
          description: 'HSTS max-age is below recommended baseline.',
          recommendation: 'Set HSTS max-age to at least 15552000 seconds.',
        },
      ],
    });

    assert.deepEqual(summary, {
      score: 62,
      grade: 'D',
      riskLevel: 'Warning',
      responseTimeMs: 420,
      redirectHops: 1,
      totalFindings: 3,
      highestSeverity: 'high',
      findingsBySeverity: {
        high: 1,
        medium: 1,
        low: 1,
      },
      topFindings: [
        {
          title: 'Missing Content-Security-Policy',
          severity: 'high',
          category: 'security-headers',
          recommendation: 'Add a tested CSP.',
        },
        {
          title: 'Strict-Transport-Security max-age is too low',
          severity: 'medium',
          category: 'transport-security',
          recommendation: 'Set HSTS max-age to at least 15552000 seconds.',
        },
        {
          title: 'Cache policy can expose stale content',
          severity: 'low',
          category: 'security-headers',
          recommendation: 'Tighten cache headers on authenticated surfaces.',
        },
      ],
      executiveSummary:
        'Sentinel calificó este objetivo con grado D (62/100) y nivel Warning; se detectaron 3 hallazgos, con severidad máxima high.',
      technicalSummary:
        'HTTP 200. HTTPS activo. Redirecciones: 1. Tiempo de respuesta: 420 ms. Categorías afectadas: security-headers, transport-security.',
      recommendedNextActions: [
        'Priorizar Missing Content-Security-Policy: Add a tested CSP.',
        'Corregir Strict-Transport-Security max-age is too low: Set HSTS max-age to at least 15552000 seconds.',
        'Revisar Cache policy can expose stale content: Tighten cache headers on authenticated surfaces.',
      ],
    });
  });

  it('returns a clean monitoring action when the scan has no findings', () => {
    const summary = summarizeScan({
      ...baseScan,
      score: 95,
      grade: 'A',
      riskLevel: 'Secure',
      findings: [],
    });

    assert.equal(summary.totalFindings, 0);
    assert.equal(summary.highestSeverity, undefined);
    assert.deepEqual(summary.topFindings, []);
    assert.equal(
      summary.executiveSummary,
      'Sentinel calificó este objetivo con grado A (95/100) y nivel Secure; no se detectaron hallazgos en la revisión pasiva pública.',
    );
    assert.deepEqual(summary.recommendedNextActions, [
      'Mantener monitoreo continuo de cabeceras, TLS, DNS y redirecciones después de cada despliegue.',
    ]);
  });
});
