import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import Fastify from 'fastify';
import { registerHealthRoutes } from './health.routes.js';

describe('registerHealthRoutes', () => {
  it('reports unconfigured dependencies without failing health', async () => {
    const app = Fastify({ logger: false });
    await registerHealthRoutes(app, {
      databaseUrl: undefined,
      now: () => new Date('2026-06-13T00:00:00.000Z'),
      redisUrl: undefined,
    });

    const response = await app.inject('/health');
    await app.close();

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {
      ok: true,
      service: 'sentinel-api',
      timestamp: '2026-06-13T00:00:00.000Z',
      dependencies: {
        database: {
          configured: false,
          status: 'not_configured',
        },
        redis: {
          configured: false,
          status: 'not_configured',
        },
      },
    });
  });

  it('reports configured dependencies as healthy', async () => {
    const app = Fastify({ logger: false });
    await registerHealthRoutes(app, {
      checkDatabase: async () => {},
      checkRedis: async () => {},
      databaseUrl: 'postgresql://sentinel:sentinel@localhost:5432/sentinel',
      now: () => new Date('2026-06-13T00:00:00.000Z'),
      redisUrl: 'redis://localhost:6379',
    });

    const response = await app.inject('/health');
    await app.close();

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {
      ok: true,
      service: 'sentinel-api',
      timestamp: '2026-06-13T00:00:00.000Z',
      dependencies: {
        database: {
          configured: true,
          status: 'ok',
        },
        redis: {
          configured: true,
          status: 'ok',
        },
      },
    });
  });

  it('returns 503 when a configured dependency fails', async () => {
    const app = Fastify({ logger: false });
    await registerHealthRoutes(app, {
      checkDatabase: async () => {
        throw new Error('connection refused');
      },
      checkRedis: async () => {},
      databaseUrl: 'postgresql://sentinel:sentinel@localhost:5432/sentinel',
      now: () => new Date('2026-06-13T00:00:00.000Z'),
      redisUrl: 'redis://localhost:6379',
    });

    const response = await app.inject('/health');
    await app.close();

    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.json(), {
      ok: false,
      service: 'sentinel-api',
      timestamp: '2026-06-13T00:00:00.000Z',
      dependencies: {
        database: {
          configured: true,
          status: 'error',
        },
        redis: {
          configured: true,
          status: 'ok',
        },
      },
    });
  });
});
