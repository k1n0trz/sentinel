import type { FastifyInstance } from 'fastify';
import { getSavedReport } from '../scans/scan-repository.js';

export const registerReportRoutes = async (app: FastifyInstance) => {
  app.get('/reports/:scanId', async (request, reply) => {
    const { scanId } = request.params as { scanId: string };
    const report = await getSavedReport(scanId);

    if (!report) {
      return reply.status(404).send({ error: 'Scan not found' });
    }

    return report;
  });
};
