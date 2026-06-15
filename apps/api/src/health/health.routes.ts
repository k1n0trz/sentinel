import type { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { env } from '../config/env.js';
import { prisma } from '../database/prisma.js';

type DependencyStatus = {
  configured: boolean;
  status: 'error' | 'not_configured' | 'ok';
};

type HealthDependencies = {
  checkDatabase?: () => Promise<void>;
  checkRedis?: () => Promise<void>;
  databaseUrl?: string;
  now?: () => Date;
  redisUrl?: string;
};

const checkDatabase = async () => {
  await prisma.$queryRaw`SELECT 1`;
};

const checkRedis = async (redisUrl: string) => {
  const redis = new Redis(redisUrl, {
    connectTimeout: 1000,
    enableOfflineQueue: false,
    lazyConnect: true,
    maxRetriesPerRequest: 0,
  });

  try {
    await redis.connect();
    await redis.ping();
  } finally {
    redis.disconnect();
  }
};

const getDependencyStatus = async (
  configured: boolean,
  check: () => Promise<void>,
): Promise<DependencyStatus> => {
  if (!configured) {
    return {
      configured: false,
      status: 'not_configured',
    };
  }

  try {
    await check();

    return {
      configured: true,
      status: 'ok',
    };
  } catch {
    return {
      configured: true,
      status: 'error',
    };
  }
};

export const registerHealthRoutes = async (
  app: FastifyInstance,
  dependencies: HealthDependencies = {},
) => {
  const databaseUrl = dependencies.databaseUrl ?? env.DATABASE_URL;
  const redisUrl = dependencies.redisUrl ?? env.REDIS_URL;
  const now = dependencies.now ?? (() => new Date());
  const databaseCheck = dependencies.checkDatabase ?? checkDatabase;
  const redisCheck =
    dependencies.checkRedis ?? (() => checkRedis(redisUrl ?? ''));

  app.get('/health', async (_request, reply) => {
    const [database, redis] = await Promise.all([
      getDependencyStatus(Boolean(databaseUrl), databaseCheck),
      getDependencyStatus(Boolean(redisUrl), redisCheck),
    ]);
    const ok = database.status !== 'error' && redis.status !== 'error';
    const body = {
      ok,
      service: 'sentinel-api',
      timestamp: now().toISOString(),
      dependencies: {
        database,
        redis,
      },
    };

    return reply.status(ok ? 200 : 503).send(body);
  });
};
