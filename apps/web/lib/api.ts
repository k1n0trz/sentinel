import { scanResultSchema, type FreeScanRequest, type ScanResult } from '@sentinel/shared';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4100';

export const runFreeScan = async (payload: FreeScanRequest): Promise<ScanResult> => {
  const response = await fetch(`${apiUrl}/public/scans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof data === 'object' && data && 'error' in data ? String(data.error) : 'Scan failed';
    throw new Error(message);
  }

  return scanResultSchema.parse(data);
};
