import type { Finding, ScanResult } from '@sentinel/shared';
import { AppError } from '../common/errors.js';
import { prisma } from '../database/prisma.js';
import { summarizeScan } from './scan-report-summary.js';

type ScanCreateArgs = Parameters<typeof prisma.scan.create>[0];

export type ScanPersistenceClient = {
  scan: {
    create: (args: ScanCreateArgs) => Promise<unknown>;
  };
};

type PersistScanDependencies = {
  client?: ScanPersistenceClient;
  databaseUrl?: string;
};

const riskLevelToDb = (riskLevel: ScanResult['riskLevel']) =>
  riskLevel.toUpperCase() as
    | 'SECURE'
    | 'GOOD'
    | 'WARNING'
    | 'RISKY'
    | 'CRITICAL';

const severityToDb = (severity: Finding['severity']) =>
  severity.toUpperCase() as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export const persistScan = async (
  scan: ScanResult,
  options: { public: boolean; hiddenFromPublicResults: boolean },
  dependencies: PersistScanDependencies = {},
) => {
  const databaseUrl = dependencies.databaseUrl ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    return;
  }

  const client = dependencies.client ?? prisma;
  const reportSummary = summarizeScan(scan);

  try {
    await client.scan.create({
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
        report: {
          create: {
            summary: reportSummary,
            executiveSummary: reportSummary.executiveSummary,
            technicalSummary: reportSummary.technicalSummary,
          },
        },
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
  } catch (error) {
    throw new AppError(
      error instanceof Error
        ? `Scan persistence is unavailable: ${error.message}`
        : 'Scan persistence is unavailable.',
      503,
    );
  }
};
