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

export const listRecentScans = (limit = 20) =>
  Array.from(scans.values())
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, limit);

export const listRecentPublicScans = (limit = 20) =>
  listRecentScans(100)
    .filter((scan) => {
      const visibility = scanVisibility.get(scan.id);
      return visibility?.public && !visibility.hiddenFromPublicResults;
    })
    .slice(0, limit);
