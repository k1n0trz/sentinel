import {
  publicReportSchema,
  scanResultSchema,
  type FreeScanRequest,
  type PublicReport,
  type ScanResult,
} from '@sentinel/shared';

const publicApiPath = '/api/public';

export const runFreeScan = async (
  payload: FreeScanRequest,
): Promise<ScanResult> => {
  const response = await fetch(`${publicApiPath}/scans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof data === 'object' && data && 'error' in data
        ? String(data.error)
        : 'Scan failed';
    throw new Error(message);
  }

  return scanResultSchema.parse(data);
};

export const getPublicScan = async (scanId: string): Promise<ScanResult> => {
  const response = await fetch(
    `${publicApiPath}/scans/${encodeURIComponent(scanId)}`,
  );
  const data: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof data === 'object' && data && 'error' in data
        ? String(data.error)
        : 'Scan not found';
    throw new Error(message);
  }

  return scanResultSchema.parse(data);
};

export const getPublicReport = async (
  scanId: string,
): Promise<PublicReport> => {
  const response = await fetch(
    `${publicApiPath}/reports/${encodeURIComponent(scanId)}`,
  );
  const data: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof data === 'object' && data && 'error' in data
        ? String(data.error)
        : 'Report not found';
    throw new Error(message);
  }

  return publicReportSchema.parse(data);
};
