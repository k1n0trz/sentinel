import type { FastifyInstance } from 'fastify';
import { getSavedScan } from '../scans/scan-repository.js';
import { summarizeScan } from '../scans/scan-report-summary.js';

export const registerReportRoutes = async (app: FastifyInstance) => {
  app.get('/reports/:scanId', async (request, reply) => {
    const { scanId } = request.params as { scanId: string };
    const scan = await getSavedScan(scanId);

    if (!scan) {
      return reply.status(404).send({ error: 'Scan not found' });
    }

    return {
      scan,
      summary: summarizeScan(scan),
    };
  });
};
