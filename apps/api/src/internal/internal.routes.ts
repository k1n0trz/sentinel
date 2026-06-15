import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';
import {
  getRecentSavedScans,
  type RecentSavedScan,
} from '../scans/scan-repository.js';

type InternalRouteDependencies = {
  getRecentScans?: () => Promise<RecentSavedScan[]>;
  internalApiKey?: string;
};

const internalKeyHeader = 'x-sentinel-internal-key';

export const registerInternalRoutes = async (
  app: FastifyInstance,
  dependencies: InternalRouteDependencies = {},
) => {
  const getRecentScans = dependencies.getRecentScans ?? getRecentSavedScans;
  const internalApiKey =
    dependencies.internalApiKey ?? env.SENTINEL_INTERNAL_API_KEY;

  app.get('/internal/scans/recent', async (request, reply) => {
    const providedKey = request.headers[internalKeyHeader];

    if (
      !internalApiKey ||
      Array.isArray(providedKey) ||
      providedKey !== internalApiKey
    ) {
      return reply.status(401).send({ error: 'Unauthorized internal request.' });
    }

    return {
      scans: await getRecentScans(),
    };
  });
};
