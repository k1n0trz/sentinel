import {
  scanReportSummarySchema,
  scanResultSchema,
  type ScanReportSummary,
  type ScanResult,
} from '@sentinel/shared';
import { AppError } from '../common/errors.js';
import { prisma } from '../database/prisma.js';
import { getScan, getScanVisibility } from './scan-store.js';
import { summarizeScan } from './scan-report-summary.js';

type GetScanOptions = {
  publicOnly?: boolean;
};

type ScanFindFirstArgs = Parameters<typeof prisma.scan.findFirst>[0];

type PersistedScanRow = {
  rawResult: unknown;
  report?: {
    summary: unknown;
  } | null;
};

export type ScanRepositoryClient = {
  scan: {
    findFirst: (args: ScanFindFirstArgs) => Promise<PersistedScanRow | null>;
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
