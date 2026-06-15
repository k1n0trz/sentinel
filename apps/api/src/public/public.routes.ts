import type { FastifyInstance } from 'fastify';
import { freeScanRequestSchema } from '@sentinel/shared';
import { ZodError } from 'zod';
import { AppError } from '../common/errors.js';
import { normalizeTargetUrl } from '../common/url.js';
import { env } from '../config/env.js';
import { runFreeScan } from '../scans/free-scan.service.js';
import { getSavedReport, getSavedScan } from '../scans/scan-repository.js';
import { createDomainRateLimiter } from './domain-rate-limit.js';

const publicScanDomainLimiter = createDomainRateLimiter({
  max: env.FREE_SCAN_DOMAIN_RATE_LIMIT_MAX,
  windowMs: env.FREE_SCAN_DOMAIN_RATE_LIMIT_WINDOW_MS,
});

export const registerPublicRoutes = async (app: FastifyInstance) => {
  app.post('/public/scans', async (request, reply) => {
    try {
      const scanRequest = freeScanRequestSchema.parse(request.body);
      const domainLimit = publicScanDomainLimiter.consume(
        normalizeTargetUrl(scanRequest.url),
      );

      if (!domainLimit.allowed) {
        return reply
          .status(429)
          .header('Retry-After', Math.ceil(domainLimit.retryAfterMs / 1000))
          .send({
            error: 'Too many scans requested for this domain. Try again later.',
            retryAfterMs: domainLimit.retryAfterMs,
          });
      }

      return await runFreeScan(scanRequest, { public: true });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .status(400)
          .send({ error: 'Invalid public scan request', issues: error.issues });
      }

      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message });
      }

      throw error;
    }
  });

  app.get('/public/scans/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const scan = await getSavedScan(id, { publicOnly: true });

    if (!scan) {
      return reply.status(404).send({ error: 'Scan not found' });
    }

    return scan;
  });

  app.get('/public/reports/:scanId', async (request, reply) => {
    const { scanId } = request.params as { scanId: string };
    const report = await getSavedReport(scanId, { publicOnly: true });

    if (!report) {
      return reply.status(404).send({ error: 'Scan not found' });
    }

    return {
      ...report,
      public: true,
    };
  });
};
