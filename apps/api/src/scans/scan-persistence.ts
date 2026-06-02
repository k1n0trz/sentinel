import type { Finding, ScanResult } from '@sentinel/shared';
import { prisma } from '../database/prisma.js';

const riskLevelToDb = (riskLevel: ScanResult['riskLevel']) =>
  riskLevel.toUpperCase() as 'SECURE' | 'GOOD' | 'WARNING' | 'RISKY' | 'CRITICAL';

const severityToDb = (severity: Finding['severity']) =>
  severity.toUpperCase() as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export const persistScan = async (
  scan: ScanResult,
  options: { public: boolean; hiddenFromPublicResults: boolean },
) => {
  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    await prisma.scan.create({
      data: {
        id: scan.id,
        targetUrl: scan.targetUrl,
        finalUrl: scan.finalUrl,
        type: options.public ? 'public-passive' : 'free-passive',
        status: 'COMPLETED',
        score: scan.score,
        grade: scan.grade,
        riskLevel: riskLevelToDb(scan.riskLevel),
        httpStatus: scan.httpStatus,
        responseTimeMs: scan.metadata?.responseTimeMs,
        public: options.public,
        hiddenFromPublicResults: options.hiddenFromPublicResults,
        rawResult: scan,
        startedAt: new Date(scan.createdAt),
        finishedAt: new Date(scan.createdAt),
        findings: {
          create: scan.findings.map((finding) => ({
            id: finding.id,
            module: finding.category,
            title: finding.title,
            description: finding.description,
            severity: severityToDb(finding.severity),
            recommendation: finding.recommendation,
          })),
        },
      },
    });
  } catch {
    // Local development can run without PostgreSQL; in-memory scan storage remains the fallback.
  }
};
