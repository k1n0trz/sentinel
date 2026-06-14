import assert from 'node:assert/strict';
import type { ScanResult } from '@sentinel/shared';
import { prisma } from '../apps/api/src/database/prisma.js';
import { persistScan } from '../apps/api/src/scans/scan-persistence.js';
import { getSavedReport } from '../apps/api/src/scans/scan-repository.js';

const scan: ScanResult = {
  id: `smoke_${Date.now()}`,
  targetUrl: 'https://example.com/',
  finalUrl: 'https://example.com/',
  status: 'completed',
  httpStatus: 200,
  https: true,
  score: 90,
  grade: 'A',
  riskLevel: 'Secure',
  headers: [],
  findings: [
    {
      id: `finding_${Date.now()}`,
      title: 'Missing Content-Security-Policy',
      severity: 'high',
      category: 'security-headers',
      description: 'CSP is missing.',
      recommendation: 'Add a tested CSP.',
    },
  ],
  metadata: {
    responseTimeMs: 123,
    redirectChain: [],
    rawHeaders: [],
  },
  createdAt: new Date().toISOString(),
};

const main = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for the DB persistence smoke test.');
  }

  await persistScan(scan, {
    public: true,
    hiddenFromPublicResults: false,
  });

  const persistedReport = await getSavedReport(scan.id, { publicOnly: true });
  const persistedScan = await prisma.scan.findUnique({
    where: { id: scan.id },
    include: {
      findings: true,
      report: true,
    },
  });

  assert.ok(persistedReport, 'expected getSavedReport to return the persisted report');
  assert.ok(persistedScan, 'expected Scan row to exist');
  assert.equal(persistedScan.findings.length, 1);
  assert.ok(persistedScan.report, 'expected Report row to exist');
  assert.equal(
    persistedScan.report?.executiveSummary,
    persistedReport.summary.executiveSummary,
  );
  assert.equal(
    persistedScan.report?.technicalSummary,
    persistedReport.summary.technicalSummary,
  );
  assert.equal(persistedReport.scan.id, scan.id);
  assert.equal(persistedReport.summary.highestSeverity, 'high');

  await prisma.finding.deleteMany({ where: { scanId: scan.id } });
  await prisma.report.deleteMany({ where: { scanId: scan.id } });
  await prisma.scan.delete({ where: { id: scan.id } });

  console.log(
    JSON.stringify(
      {
        ok: true,
        scanId: scan.id,
        persistedFindings: persistedScan.findings.length,
        reportSnapshot: persistedReport.summary.executiveSummary,
      },
      null,
      2,
    ),
  );
};

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
