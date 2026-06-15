import {
  scanReportSummarySchema,
  scanResultSchema,
  type RiskLevel,
  type ScanGrade,
  type ScanReportSummary,
  type ScanResult,
  type ScanStatus,
} from '@sentinel/shared';
import { AppError } from '../common/errors.js';
import { prisma } from '../database/prisma.js';
import { getScan, getScanVisibility } from './scan-store.js';
import { summarizeScan } from './scan-report-summary.js';

type GetScanOptions = {
  publicOnly?: boolean;
};

type ScanFindFirstArgs = Parameters<typeof prisma.scan.findFirst>[0];
type ScanFindManyArgs = Parameters<typeof prisma.scan.findMany>[0];

type PersistedScanRow = {
  rawResult: unknown;
  report?: {
    summary: unknown;
  } | null;
};

export type ScanRepositoryClient = {
  scan: {
    findFirst: (args: ScanFindFirstArgs) => Promise<PersistedScanRow | null>;
    findMany?: (args: ScanFindManyArgs) => Promise<PersistedScanSummaryRow[]>;
  };
};

type GetSavedScanDependencies = {
  client?: ScanRepositoryClient;
  databaseUrl?: string;
};

type SavedReport = {
  scan: ScanResult;
  summary: ScanReportSummary;
};

export type RecentSavedScan = {
  id: string;
  targetUrl: string;
  finalUrl?: string;
  status: ScanStatus;
  score: number;
  grade?: ScanGrade;
  riskLevel: RiskLevel;
  httpStatus?: number;
  responseTimeMs?: number;
  public: boolean;
  hiddenFromPublicResults: boolean;
  createdAt: string;
};

type PersistedScanSummaryRow = {
  id: string;
  targetUrl: string;
  finalUrl: string | null;
  status: string;
  score: number;
  grade: string | null;
  riskLevel: string;
  httpStatus: number | null;
  responseTimeMs: number | null;
  public: boolean;
  hiddenFromPublicResults: boolean;
  createdAt: Date;
};

const dbStatusToApiStatus = (status: string): ScanStatus =>
  status.toLowerCase() as ScanStatus;

const dbRiskLevelToApiRiskLevel = (riskLevel: string): RiskLevel => {
  const normalized = riskLevel.toLowerCase();

  if (normalized === 'secure') return 'Secure';
  if (normalized === 'good') return 'Good';
  if (normalized === 'warning') return 'Warning';
  if (normalized === 'risky') return 'Risky';
  return 'Critical';
};

const persistedSummaryToRecentScan = (
  row: PersistedScanSummaryRow,
): RecentSavedScan => ({
  id: row.id,
  targetUrl: row.targetUrl,
  ...(row.finalUrl ? { finalUrl: row.finalUrl } : {}),
  status: dbStatusToApiStatus(row.status),
  score: row.score,
  ...(row.grade ? { grade: row.grade as ScanGrade } : {}),
  riskLevel: dbRiskLevelToApiRiskLevel(row.riskLevel),
  ...(typeof row.httpStatus === 'number' ? { httpStatus: row.httpStatus } : {}),
  ...(typeof row.responseTimeMs === 'number'
    ? { responseTimeMs: row.responseTimeMs }
    : {}),
  public: row.public,
  hiddenFromPublicResults: row.hiddenFromPublicResults,
  createdAt: row.createdAt.toISOString(),
});

export const getSavedScan = async (
  id: string,
  options: GetScanOptions = {},
  dependencies: GetSavedScanDependencies = {},
): Promise<ScanResult | undefined> => {
  const memoryScan = getScan(id);

  if (memoryScan) {
    if (options.publicOnly && !getScanVisibility(id)?.public) {
      return undefined;
    }

    return memoryScan;
  }

  const databaseUrl = dependencies.databaseUrl ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    return undefined;
  }

  const client = dependencies.client ?? prisma;
  let persistedScan: { rawResult: unknown } | null;

  try {
    persistedScan = await client.scan.findFirst({
      where: {
        id,
        ...(options.publicOnly ? { public: true } : {}),
      },
      select: {
        rawResult: true,
      },
    });
  } catch (error) {
    throw new AppError(
      error instanceof Error
        ? `Scan repository is unavailable: ${error.message}`
        : 'Scan repository is unavailable.',
      503,
    );
  }

  if (!persistedScan) {
    return undefined;
  }

  try {
    return scanResultSchema.parse(persistedScan.rawResult);
  } catch {
    throw new AppError('Persisted scan payload is invalid.', 503);
  }
};

export const getSavedReport = async (
  id: string,
  options: GetScanOptions = {},
  dependencies: GetSavedScanDependencies = {},
): Promise<SavedReport | undefined> => {
  const memoryScan = getScan(id);

  if (memoryScan) {
    if (options.publicOnly && !getScanVisibility(id)?.public) {
      return undefined;
    }

    return {
      scan: memoryScan,
      summary: summarizeScan(memoryScan),
    };
  }

  const databaseUrl = dependencies.databaseUrl ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    return undefined;
  }

  const client = dependencies.client ?? prisma;
  let persistedScan: PersistedScanRow | null;

  try {
    persistedScan = await client.scan.findFirst({
      where: {
        id,
        ...(options.publicOnly ? { public: true } : {}),
      },
      select: {
        rawResult: true,
        report: {
          select: {
            summary: true,
          },
        },
      },
    });
  } catch (error) {
    throw new AppError(
      error instanceof Error
        ? `Scan report repository is unavailable: ${error.message}`
        : 'Scan report repository is unavailable.',
      503,
    );
  }

  if (!persistedScan) {
    return undefined;
  }

  let scan: ScanResult;

  try {
    scan = scanResultSchema.parse(persistedScan.rawResult);
  } catch {
    throw new AppError('Persisted scan payload is invalid.', 503);
  }

  if (!persistedScan.report?.summary) {
    return {
      scan,
      summary: summarizeScan(scan),
    };
  }

  try {
    return {
      scan,
      summary: scanReportSummarySchema.parse(persistedScan.report.summary),
    };
  } catch {
    throw new AppError('Persisted report summary is invalid.', 503);
  }
};

export const getRecentSavedScans = async (
  dependencies: GetSavedScanDependencies = {},
): Promise<RecentSavedScan[]> => {
  const databaseUrl = dependencies.databaseUrl ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    return [];
  }

  const client = dependencies.client ?? prisma;

  if (!client.scan.findMany) {
    return [];
  }

  let persistedScans: PersistedScanSummaryRow[];

  try {
    persistedScans = await client.scan.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
        finalUrl: true,
        grade: true,
        hiddenFromPublicResults: true,
        httpStatus: true,
        id: true,
        public: true,
        responseTimeMs: true,
        riskLevel: true,
        score: true,
        status: true,
        targetUrl: true,
      },
      take: 20,
    });
  } catch (error) {
    throw new AppError(
      error instanceof Error
        ? `Recent scan repository is unavailable: ${error.message}`
        : 'Recent scan repository is unavailable.',
      503,
    );
  }

  return persistedScans.map(persistedSummaryToRecentScan);
};
