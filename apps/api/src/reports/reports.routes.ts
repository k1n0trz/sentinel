import type { FastifyInstance } from 'fastify';
import { getScan } from '../scans/scan-store.js';

export const registerReportRoutes = async (app: FastifyInstance) => {
  app.get('/reports/:scanId', async (request, reply) => {
    const { scanId } = request.params as { scanId: string };
    const scan = getScan(scanId);

    if (!scan) {
      return reply.status(404).send({ error: 'Scan not found' });
    }

    return {
      scan,
      summary: {
        score: scan.score,
        riskLevel: scan.riskLevel,
        findingsBySeverity: scan.findings.reduce<Record<string, number>>((acc, finding) => {
          acc[finding.severity] = (acc[finding.severity] ?? 0) + 1;
          return acc;
        }, {}),
      },
    };
  });
};

