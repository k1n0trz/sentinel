import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../common/errors.js';
import { getScan } from './scan-store.js';
import { runFreeScan } from './free-scan.service.js';

export const registerScanRoutes = async (app: FastifyInstance) => {
  app.post('/scans/free', async (request, reply) => {
    try {
      return await runFreeScan(request.body);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ error: 'Invalid scan request', issues: error.issues });
      }

      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message });
      }

      throw error;
    }
  });

  app.get('/scans/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const scan = getScan(id);

    if (!scan) {
      return reply.status(404).send({ error: 'Scan not found' });
    }

    return scan;
  });
};

