import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ScanResult } from '@sentinel/shared';
import { AppError } from '../common/errors.js';
import {
  getRecentSavedScans,
  getSavedReport,
  getSavedScan,
} from './scan-repository.js';

const scan: ScanResult = {
  id: 'scan_persisted_test',
  targetUrl: 'https://example.com/',
  finalUrl: 'https://example.com/',
  status: 'completed',
  httpStatus: 200,
  https: true,
  score: 88,
  grade: 'B',
  riskLevel: 'Good',
  headers: [],
  findings: [],
  createdAt: '2026-06-13T00:00:00.000Z',
};

const persistedSummary = {
  score: 88,
  grade: 'B',
  riskLevel: 'Good',
  redirectHops: 0,
  totalFindings: 0,
  findingsBySeverity: {},
  topFindings: [],
  executiveSummary:
    'Stored executive summary from the audited report snapshot.',
  technicalSummary:
    'Stored technical summary from the audited report snapshot.',
  recommendedNextActions: ['Keep monitoring this target.'],
};

describe('getSavedScan', () => {
  it('returns undefined without hitting the database when DATABASE_URL is not configured', async () => {
    let called = false;
    const client = {
      scan: {
        findFirst: async () => {
          called = true;
          return { rawResult: scan };
        },
      },
    };

    assert.equal(
      await getSavedScan(
        'scan_missing_local_test',
        {},
        { client, databaseUrl: undefined },
      ),
      undefined,
    );
    assert.equal(called, false);
  });

  it('reads and validates persisted scan payloads when DATABASE_URL is configured', async () => {
    let query: unknown;
    const client = {
      scan: {
        findFirst: async (args: unknown) => {
          query = args;
          return { rawResult: scan };
        },
      },
    };

    assert.deepEqual(
      await getSavedScan(
        'scan_persisted_test',
        { publicOnly: true },
        {
          client,
          databaseUrl: 'postgresql://sentinel:sentinel@localhost:5432/sentinel',
        },
      ),
      scan,
    );
    assert.deepEqual(query, {
      where: {
        id: 'scan_persisted_test',
        public: true,
      },
      select: {
        rawResult: true,
      },
    });
  });

  it('returns undefined when no persisted scan exists', async () => {
    const client = {
      scan: {
        findFirst: async () => null,
      },
    };

    assert.equal(
      await getSavedScan(
        'scan_not_found_test',
        {},
        {
          client,
          databaseUrl: 'postgresql://sentinel:sentinel@localhost:5432/sentinel',
        },
      ),
      undefined,
    );
  });

  it('fails explicitly when configured database reads fail', async () => {
    const client = {
      scan: {
        findFirst: async () => {
          throw new Error('database unavailable');
        },
      },
    };

    await assert.rejects(
      () =>
        getSavedScan(
          'scan_read_failure_test',
          {},
          {
            client,
            databaseUrl:
              'postgresql://sentinel:sentinel@localhost:5432/sentinel',
          },
        ),
      (error) =>
        error instanceof AppError &&
        error.statusCode === 503 &&
        error.message.includes('repository'),
    );
  });

  it('fails explicitly when persisted scan payloads are invalid', async () => {
    const client = {
      scan: {
        findFirst: async () => ({ rawResult: { id: 'broken' } }),
      },
    };

    await assert.rejects(
      () =>
        getSavedScan(
          'scan_invalid_payload_test',
          {},
          {
            client,
            databaseUrl:
              'postgresql://sentinel:sentinel@localhost:5432/sentinel',
          },
        ),
      (error) =>
        error instanceof AppError &&
        error.statusCode === 503 &&
        error.message.includes('payload'),
    );
  });
});

describe('getSavedReport', () => {
  it('reads persisted scan payloads with their stored report summary snapshots', async () => {
    let query: unknown;
    const client = {
      scan: {
        findFirst: async (args: unknown) => {
          query = args;
          return {
            rawResult: scan,
            report: {
              summary: persistedSummary,
            },
          };
        },
      },
    };

    assert.deepEqual(
      await getSavedReport(
        'scan_persisted_test',
        { publicOnly: true },
        {
          client,
          databaseUrl: 'postgresql://sentinel:sentinel@localhost:5432/sentinel',
        },
      ),
      {
        scan,
        summary: persistedSummary,
      },
    );
    assert.deepEqual(query, {
      where: {
        id: 'scan_persisted_test',
        public: true,
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
  });

  it('fails explicitly when persisted report summaries are invalid', async () => {
    const client = {
      scan: {
        findFirst: async () => ({
          rawResult: scan,
          report: {
            summary: { score: 88 },
          },
        }),
      },
    };

    await assert.rejects(
      () =>
        getSavedReport(
          'scan_invalid_report_summary_test',
          {},
          {
            client,
            databaseUrl:
              'postgresql://sentinel:sentinel@localhost:5432/sentinel',
          },
        ),
      (error) =>
        error instanceof AppError &&
        error.statusCode === 503 &&
        error.message.includes('report summary'),
    );
  });
});

describe('getRecentSavedScans', () => {
  it('reads recent persisted scan summaries in reverse chronological order', async () => {
    let query: unknown;
    const client = {
      scan: {
        findFirst: async () => null,
        findMany: async (args: unknown) => {
          query = args;
          return [
            {
              id: 'scan_recent_test',
              targetUrl: 'https://example.com/',
              finalUrl: 'https://example.com/',
              status: 'COMPLETED',
              score: 88,
              grade: 'B',
              riskLevel: 'GOOD',
              httpStatus: 200,
              responseTimeMs: 45,
              public: true,
              hiddenFromPublicResults: true,
              createdAt: new Date('2026-06-15T01:10:37.156Z'),
            },
          ];
        },
      },
    };

    assert.deepEqual(
      await getRecentSavedScans({
        client,
        databaseUrl: 'postgresql://sentinel:sentinel@localhost:5432/sentinel',
      }),
      [
        {
          id: 'scan_recent_test',
          targetUrl: 'https://example.com/',
          finalUrl: 'https://example.com/',
          status: 'completed',
          score: 88,
          grade: 'B',
          riskLevel: 'Good',
          httpStatus: 200,
          responseTimeMs: 45,
          public: true,
          hiddenFromPublicResults: true,
          createdAt: '2026-06-15T01:10:37.156Z',
        },
      ],
    );
    assert.deepEqual(query, {
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
  });

  it('returns an empty list when DATABASE_URL is not configured', async () => {
    let called = false;
    const client = {
      scan: {
        findFirst: async () => null,
        findMany: async () => {
          called = true;
          return [];
        },
      },
    };

    assert.deepEqual(
      await getRecentSavedScans({ client, databaseUrl: undefined }),
      [],
    );
    assert.equal(called, false);
  });
});
