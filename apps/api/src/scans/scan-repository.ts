import { scanResultSchema, type ScanResult } from '@sentinel/shared';
import { prisma } from '../database/prisma.js';
import { getScan, getScanVisibility } from './scan-store.js';

type GetScanOptions = {
  publicOnly?: boolean;
};

export const getSavedScan = async (
  id: string,
  options: GetScanOptions = {},
): Promise<ScanResult | undefined> => {
  const memoryScan = getScan(id);

  if (memoryScan) {
    if (options.publicOnly && !getScanVisibility(id)?.public) {
      return undefined;
    }

    return memoryScan;
  }

  if (!process.env.DATABASE_URL) {
    return undefined;
  }

  try {
    const persistedScan = await prisma.scan.findFirst({
      where: {
        id,
        ...(options.publicOnly ? { public: true } : {}),
      },
      select: {
        rawResult: true,
      },
    });

    if (!persistedScan) {
      return undefined;
    }

    return scanResultSchema.parse(persistedScan.rawResult);
  } catch {
    return undefined;
  }
};
