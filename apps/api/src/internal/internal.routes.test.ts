import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import Fastify from 'fastify';
import { registerInternalRoutes } from './internal.routes.js';

describe('registerInternalRoutes', () => {
  it('rejects private scan history requests without the internal key', async () => {
    const app = Fastify();

    await registerInternalRoutes(app, {
      getRecentScans: async () => [],
      internalApiKey: 'test-internal-key',
    });

    const response = await app.inject('/internal/scans/recent');

    assert.equal(response.statusCode, 401);
    assert.deepEqual(response.json(), { error: 'Unauthorized internal request.' });
  });

  it('returns recent scan history when the internal key matches', async () => {
    const app = Fastify();

    await registerInternalRoutes(app, {
      getRecentScans: async () => [
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
      internalApiKey: 'test-internal-key',
    });

    const response = await app.inject({
      headers: {
        'x-sentinel-internal-key': 'test-internal-key',
      },
      url: '/internal/scans/recent',
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {
      scans: [
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
    });
  });

  it('returns user domains when the internal key and user headers match', async () => {
    const app = Fastify();

    await registerInternalRoutes(app, {
      getRecentScans: async () => [],
      internalApiKey: 'test-internal-key',
      listDomains: async (owner) => [
        {
          id: 'domain_1',
          hostname: owner.email,
          verified: false,
          verificationMethod: 'dns-txt',
          verificationToken: 'sentinel-verify=test',
          createdAt: '2026-06-15T01:00:00.000Z',
        },
      ],
    });

    const response = await app.inject({
      headers: {
        'x-sentinel-internal-key': 'test-internal-key',
        'x-sentinel-user-email': 'owner@example.com',
        'x-sentinel-user-name': 'Owner Example',
      },
      url: '/internal/domains',
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {
      domains: [
        {
          id: 'domain_1',
          hostname: 'owner@example.com',
          verified: false,
          verificationMethod: 'dns-txt',
          verificationToken: 'sentinel-verify=test',
          createdAt: '2026-06-15T01:00:00.000Z',
        },
      ],
    });
  });

  it('returns user projects when the internal key and user headers match', async () => {
    const app = Fastify();

    await registerInternalRoutes(app, {
      getRecentScans: async () => [],
      internalApiKey: 'test-internal-key',
      listProjects: async (owner) => [
        {
          id: 'project_1',
          name: owner.email,
          domainCount: 2,
          averageScore: 90,
          createdAt: '2026-06-15T01:00:00.000Z',
        },
      ],
    });

    const response = await app.inject({
      headers: {
        'x-sentinel-internal-key': 'test-internal-key',
        'x-sentinel-user-email': 'owner@example.com',
      },
      url: '/internal/projects',
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {
      projects: [
        {
          id: 'project_1',
          name: 'owner@example.com',
          domainCount: 2,
          averageScore: 90,
          createdAt: '2026-06-15T01:00:00.000Z',
        },
      ],
    });
  });

  it('creates domains for the authenticated user through the internal API', async () => {
    const app = Fastify();

    await registerInternalRoutes(app, {
      createDomain: async (owner, hostname) => ({
        id: 'domain_1',
        hostname: `${hostname}:${owner.email}`,
        verified: false,
        verificationMethod: 'dns-txt',
        verificationToken: 'sentinel-verify=test',
        createdAt: '2026-06-15T01:00:00.000Z',
      }),
      getRecentScans: async () => [],
      internalApiKey: 'test-internal-key',
    });

    const response = await app.inject({
      headers: {
        'content-type': 'application/json',
        'x-sentinel-internal-key': 'test-internal-key',
        'x-sentinel-user-email': 'owner@example.com',
      },
      method: 'POST',
      payload: {
        hostname: 'https://example.com/path',
      },
      url: '/internal/domains',
    });

    assert.equal(response.statusCode, 201);
    assert.deepEqual(response.json(), {
      domain: {
        id: 'domain_1',
        hostname: 'https://example.com/path:owner@example.com',
        verified: false,
        verificationMethod: 'dns-txt',
        verificationToken: 'sentinel-verify=test',
        createdAt: '2026-06-15T01:00:00.000Z',
      },
    });
  });
});
