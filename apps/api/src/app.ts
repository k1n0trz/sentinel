import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import { AppError } from './common/errors.js';
import { env } from './config/env.js';
import { registerHealthRoutes } from './health/health.routes.js';
import { registerInternalRoutes } from './internal/internal.routes.js';
import { registerPublicRoutes } from './public/public.routes.js';
import { registerReportRoutes } from './reports/reports.routes.js';
import { registerScanRoutes } from './scans/scans.routes.js';

export const buildApp = async () => {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: true,
  });
  await app.register(rateLimit, {
    max: env.FREE_SCAN_RATE_LIMIT_MAX,
    timeWindow: env.FREE_SCAN_RATE_LIMIT_WINDOW,
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }

    return reply.send(error);
  });

  await registerHealthRoutes(app);
  await registerInternalRoutes(app);
  await registerPublicRoutes(app);
  await registerScanRoutes(app);
  await registerReportRoutes(app);

  return app;
};
