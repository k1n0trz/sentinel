import type { ScanResult } from '@sentinel/shared';

const scans = new Map<string, ScanResult>();
const scanVisibility = new Map<string, { public: boolean; hiddenFromPublicResults: boolean }>();

export const saveScan = (
  scan: ScanResult,
  visibility: { public: boolean; hiddenFromPublicResults: boolean } = {
    public: false,
    hiddenFromPublicResults: false,
  },
) => {
  scans.set(scan.id, scan);
  scanVisibility.set(scan.id, visibility);
  return scan;
};

export const getScan = (id: string) => scans.get(id);

export const getScanVisibility = (id: string) => scanVisibility.get(id);
