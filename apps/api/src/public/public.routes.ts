import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../common/errors.js';
import { getScan, listRecentPublicScans } from '../scans/scan-store.js';
import { runFreeScan } from '../scans/free-scan.service.js';

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

  app.get('/public/scans/recent', async () => ({
    scans: listRecentPublicScans(20).map((scan) => ({
      id: scan.id,
      targetUrl: scan.targetUrl,
      finalUrl: scan.finalUrl,
      score: scan.score,
      grade: scan.grade,
      riskLevel: scan.riskLevel,
      createdAt: scan.createdAt,
    })),
  }));

  app.get('/public/scans/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const scan = getScan(id);

    if (!scan) {
      return reply.status(404).send({ error: 'Scan not found' });
    }

    return scan;
  });

  app.get('/public/reports/:scanId', async (request, reply) => {
    const { scanId } = request.params as { scanId: string };
    const scan = getScan(scanId);

    if (!scan) {
      return reply.status(404).send({ error: 'Scan not found' });
    }

    return {
      scan,
      public: true,
      summary: {
        score: scan.score,
        grade: scan.grade,
        riskLevel: scan.riskLevel,
        responseTimeMs: scan.metadata?.responseTimeMs,
        redirectHops: scan.metadata?.redirectChain.length ?? 0,
        findingsBySeverity: scan.findings.reduce<Record<string, number>>((acc, finding) => {
          acc[finding.severity] = (acc[finding.severity] ?? 0) + 1;
          return acc;
        }, {}),
      },
    };
  });
};

