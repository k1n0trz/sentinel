import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../common/errors.js';
import { runFreeScan } from '../scans/free-scan.service.js';
import { getSavedScan } from '../scans/scan-repository.js';
import { summarizeScan } from '../scans/scan-report-summary.js';

export const registerPublicRoutes = async (app: FastifyInstance) => {
  app.post('/public/scans', async (request, reply) => {
    try {
      return await runFreeScan(request.body, { public: true });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ error: 'Invalid public scan request', issues: error.issues });
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
    const scan = await getSavedScan(scanId, { publicOnly: true });

    if (!scan) {
      return reply.status(404).send({ error: 'Scan not found' });
    }

    return {
      scan,
      public: true,
      summary: summarizeScan(scan),
    };
  });
};
