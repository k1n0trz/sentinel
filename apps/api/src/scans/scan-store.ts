import type { ScanResult } from '@sentinel/shared';

const scans = new Map<string, ScanResult>();

export const saveScan = (scan: ScanResult) => {
  scans.set(scan.id, scan);
  return scan;
};

export const getScan = (id: string) => scans.get(id);

