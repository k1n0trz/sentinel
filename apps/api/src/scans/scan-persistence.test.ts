import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ScanResult } from '@sentinel/shared';
import { AppError } from '../common/errors.js';
import { persistScan } from './scan-persistence.js';

const scan: ScanResult = {
  id: 'scan_test',
  targetUrl: 'https://example.com/',
  finalUrl: 'https://example.com/',
  status: 'completed',
  httpStatus: 200,
  https: true,
  score: 90,
  grade: 'A',
  riskLevel: 'Secure',
  headers: [],
  findings: [
    {
      id: 'finding_test',
      title: 'Missing Content-Security-Policy',
      severity: 'high',
      category: 'security-headers',
      description: 'CSP is missing.',
      recommendation: 'Add a tested CSP.',
    },
  ],
  createdAt: '2026-06-13T00:00:00.000Z',
};

const visibility = {
  hiddenFromPublicResults: false,
  public: true,
};

describe('persistScan', () => {
  it('skips database writes when DATABASE_URL is not configured', async () => {
    let called = false;
    const client = {
      scan: {
        create: async () => {
          called = true;
        },
      },
    };

    await assert.doesNotReject(() =>
      persistScan(scan, visibility, { client, databaseUrl: undefined }),
    );
    assert.equal(called, false);
  });

  it('writes scans, findings and report summary when DATABASE_URL is configured', async () => {
    let payload: unknown;
    const client = {
      scan: {
        create: async (args: unknown) => {
          payload = args;
        },
      },
    };

    await persistScan(scan, visibility, {
      client,
      databaseUrl: 'postgresql://sentinel:sentinel@localhost:5432/sentinel',
    });

    assert.deepEqual(payload, {
      data: {
        id: 'scan_test',
        targetUrl: 'https://example.com/',
        finalUrl: 'https://example.com/',
        type: 'public-passive',
        status: 'COMPLETED',
        score: 90,
        grade: 'A',
        riskLevel: 'SECURE',
        httpStatus: 200,
        responseTimeMs: undefined,
        public: true,
        hiddenFromPublicResults: false,
        rawResult: scan,
        startedAt: new Date('2026-06-13T00:00:00.000Z'),
        finishedAt: new Date('2026-06-13T00:00:00.000Z'),
        report: {
          create: {
            summary: {
              score: 90,
              grade: 'A',
              riskLevel: 'Secure',
              redirectHops: 0,
              totalFindings: 1,
              highestSeverity: 'high',
              findingsBySeverity: {
                high: 1,
              },
              topFindings: [
                {
                  title: 'Missing Content-Security-Policy',
                  severity: 'high',
                  category: 'security-headers',
                  recommendation: 'Add a tested CSP.',
                },
              ],
              executiveSummary:
                'Sentinel calificó este objetivo con grado A (90/100) y nivel Secure; se detectó 1 hallazgo, con severidad máxima high.',
              technicalSummary:
                'HTTP 200. HTTPS activo. Redirecciones: 0. Tiempo de respuesta: no disponible. Categorías afectadas: security-headers.',
              recommendedNextActions: [
                'Priorizar Missing Content-Security-Policy: Add a tested CSP.',
              ],
            },
            executiveSummary:
              'Sentinel calificó este objetivo con grado A (90/100) y nivel Secure; se detectó 1 hallazgo, con severidad máxima high.',
            technicalSummary:
              'HTTP 200. HTTPS activo. Redirecciones: 0. Tiempo de respuesta: no disponible. Categorías afectadas: security-headers.',
          },
        },
        findings: {
          create: [
            {
              id: 'finding_test',
              module: 'security-headers',
              title: 'Missing Content-Security-Policy',
              description: 'CSP is missing.',
              severity: 'HIGH',
              recommendation: 'Add a tested CSP.',
            },
          ],
        },
      },
    });
  });

  it('fails explicitly when configured database persistence fails', async () => {
    const client = {
      scan: {
        create: async () => {
          throw new Error('database unavailable');
        },
      },
    };

    await assert.rejects(
      () =>
        persistScan(scan, visibility, {
          client,
          databaseUrl: 'postgresql://sentinel:sentinel@localhost:5432/sentinel',
        }),
      (error) =>
        error instanceof AppError &&
        error.statusCode === 503 &&
        error.message.includes('persistence'),
    );
  });
});
