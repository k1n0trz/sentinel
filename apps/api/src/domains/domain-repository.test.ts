import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AppError } from '../common/errors.js';
import {
  createUserDomain,
  listUserDomains,
  normalizeDomainHostname,
} from './domain-repository.js';

const owner = {
  email: 'owner@example.com',
  name: 'Owner Example',
};

describe('normalizeDomainHostname', () => {
  it('normalizes domains and URLs to lowercase hostnames', () => {
    assert.equal(normalizeDomainHostname(' SentinelCloud.dev '), 'sentinelcloud.dev');
    assert.equal(
      normalizeDomainHostname('https://WWW.Example.com/path?x=1'),
      'www.example.com',
    );
  });

  it('rejects invalid hostnames', () => {
    assert.throws(
      () => normalizeDomainHostname('https://'),
      (error) => error instanceof AppError && error.statusCode === 400,
    );
  });
});

describe('listUserDomains', () => {
  it('returns domains owned by the user through their projects', async () => {
    let query: unknown;
    const client = {
      domain: {
        findMany: async (args: unknown) => {
          query = args;
          return [
            {
              id: 'domain_1',
              hostname: 'sentinelcloud.dev',
              verified: false,
              verificationMethod: 'dns-txt',
              verificationToken: 'sentinel-verify=test',
              createdAt: new Date('2026-06-15T01:00:00.000Z'),
              scans: [
                {
                  id: 'scan_1',
                  grade: 'B',
                  score: 82,
                  riskLevel: 'GOOD',
                  createdAt: new Date('2026-06-15T01:10:00.000Z'),
                },
              ],
            },
          ];
        },
      },
      project: {
        findFirst: async () => null,
      },
      user: {
        upsert: async () => ({ id: 'user_1' }),
      },
    };

    assert.deepEqual(await listUserDomains(owner, { client }), [
      {
        id: 'domain_1',
        hostname: 'sentinelcloud.dev',
        verified: false,
        verificationMethod: 'dns-txt',
        verificationToken: 'sentinel-verify=test',
        createdAt: '2026-06-15T01:00:00.000Z',
        latestScan: {
          id: 'scan_1',
          grade: 'B',
          score: 82,
          riskLevel: 'Good',
          createdAt: '2026-06-15T01:10:00.000Z',
        },
      },
    ]);
    assert.deepEqual(query, {
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
        hostname: true,
        id: true,
        scans: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            createdAt: true,
            grade: true,
            id: true,
            riskLevel: true,
            score: true,
          },
          take: 1,
        },
        verificationMethod: true,
        verificationToken: true,
        verified: true,
      },
      where: {
        project: {
          user: {
            email: owner.email,
          },
        },
      },
    });
  });
});

describe('createUserDomain', () => {
  it('creates a default project and domain for the user when needed', async () => {
    const calls: string[] = [];
    const client = {
      domain: {
        create: async (args: unknown) => {
          calls.push('domain.create');
          assert.deepEqual(args, {
            data: {
              hostname: 'example.com',
              projectId: 'project_1',
              verificationMethod: 'dns-txt',
              verificationToken: 'sentinel-verify=fixed-token',
            },
            select: {
              createdAt: true,
              hostname: true,
              id: true,
              scans: {
                orderBy: {
                  createdAt: 'desc',
                },
                select: {
                  createdAt: true,
                  grade: true,
                  id: true,
                  riskLevel: true,
                  score: true,
                },
                take: 1,
              },
              verificationMethod: true,
              verificationToken: true,
              verified: true,
            },
          });
          return {
            id: 'domain_1',
            hostname: 'example.com',
            verified: false,
            verificationMethod: 'dns-txt',
            verificationToken: 'sentinel-verify=fixed-token',
            createdAt: new Date('2026-06-15T01:00:00.000Z'),
            scans: [],
          };
        },
        findFirst: async () => null,
      },
      project: {
        create: async () => {
          calls.push('project.create');
          return { id: 'project_1' };
        },
        findFirst: async () => null,
      },
      user: {
        upsert: async () => {
          calls.push('user.upsert');
          return { id: 'user_1' };
        },
      },
    };

    assert.deepEqual(
      await createUserDomain(owner, 'https://example.com/path', {
        client,
        tokenFactory: () => 'fixed-token',
      }),
      {
        id: 'domain_1',
        hostname: 'example.com',
        verified: false,
        verificationMethod: 'dns-txt',
        verificationToken: 'sentinel-verify=fixed-token',
        createdAt: '2026-06-15T01:00:00.000Z',
      },
    );
    assert.deepEqual(calls, ['user.upsert', 'project.create', 'domain.create']);
  });

  it('returns the existing domain instead of creating duplicates', async () => {
    let created = false;
    const existingDomain = {
      id: 'domain_existing',
      hostname: 'example.com',
      verified: true,
      verificationMethod: 'dns-txt',
      verificationToken: 'sentinel-verify=existing',
      createdAt: new Date('2026-06-15T01:00:00.000Z'),
      scans: [],
    };
    const client = {
      domain: {
        create: async () => {
          created = true;
          return existingDomain;
        },
        findFirst: async () => existingDomain,
      },
      project: {
        create: async () => ({ id: 'project_1' }),
        findFirst: async () => ({ id: 'project_1' }),
      },
      user: {
        upsert: async () => ({ id: 'user_1' }),
      },
    };

    assert.deepEqual(await createUserDomain(owner, 'example.com', { client }), {
      id: 'domain_existing',
      hostname: 'example.com',
      verified: true,
      verificationMethod: 'dns-txt',
      verificationToken: 'sentinel-verify=existing',
      createdAt: '2026-06-15T01:00:00.000Z',
    });
    assert.equal(created, false);
  });
});
