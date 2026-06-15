import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { env } from '../config/env.js';
import {
  createUserDomain,
  listUserDomains,
  type UserDomain,
} from '../domains/domain-repository.js';
import {
  listUserProjects,
  type UserProject,
} from '../projects/project-repository.js';
import {
  getRecentSavedScans,
  type RecentSavedScan,
} from '../scans/scan-repository.js';

type InternalRouteDependencies = {
  createDomain?: (
    owner: InternalDomainOwner,
    hostname: string,
  ) => Promise<UserDomain>;
  getRecentScans?: () => Promise<RecentSavedScan[]>;
  internalApiKey?: string;
  listDomains?: (owner: InternalDomainOwner) => Promise<UserDomain[]>;
  listProjects?: (owner: InternalDomainOwner) => Promise<UserProject[]>;
};

const internalKeyHeader = 'x-sentinel-internal-key';
const userEmailHeader = 'x-sentinel-user-email';
const userNameHeader = 'x-sentinel-user-name';

type InternalDomainOwner = {
  email: string;
  name?: string;
};

const createDomainBodySchema = z.object({
  hostname: z.string().trim().min(1).max(255),
});

const headerValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const registerInternalRoutes = async (
  app: FastifyInstance,
  dependencies: InternalRouteDependencies = {},
) => {
  const createDomain = dependencies.createDomain ?? createUserDomain;
  const getRecentScans = dependencies.getRecentScans ?? getRecentSavedScans;
  const listDomains = dependencies.listDomains ?? listUserDomains;
  const listProjects = dependencies.listProjects ?? listUserProjects;
  const internalApiKey =
    dependencies.internalApiKey ?? env.SENTINEL_INTERNAL_API_KEY;

  const requireInternalRequest = (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const providedKey = request.headers[internalKeyHeader];

    if (
      !internalApiKey ||
      Array.isArray(providedKey) ||
      providedKey !== internalApiKey
    ) {
      reply.status(401).send({ error: 'Unauthorized internal request.' });
      return false;
    }

    return true;
  };

  const internalOwner = (request: FastifyRequest): InternalDomainOwner | null => {
    const email = headerValue(request.headers[userEmailHeader]);
    const name = headerValue(request.headers[userNameHeader]);

    if (!email) {
      return null;
    }

    return {
      email,
      ...(name ? { name } : {}),
    };
  };

  app.get('/internal/scans/recent', async (request, reply) => {
    if (!requireInternalRequest(request, reply)) return;

    return {
      scans: await getRecentScans(),
    };
  });

  app.get('/internal/domains', async (request, reply) => {
    if (!requireInternalRequest(request, reply)) return;

    const owner = internalOwner(request);

    if (!owner) {
      return reply.status(400).send({ error: 'Missing user email.' });
    }

    return {
      domains: await listDomains(owner),
    };
  });

  app.post('/internal/domains', async (request, reply) => {
    if (!requireInternalRequest(request, reply)) return;

    const owner = internalOwner(request);

    if (!owner) {
      return reply.status(400).send({ error: 'Missing user email.' });
    }

    const body = createDomainBodySchema.parse(request.body);

    return reply.status(201).send({
      domain: await createDomain(owner, body.hostname),
    });
  });

  app.get('/internal/projects', async (request, reply) => {
    if (!requireInternalRequest(request, reply)) return;

    const owner = internalOwner(request);

    if (!owner) {
      return reply.status(400).send({ error: 'Missing user email.' });
    }

    return {
      projects: await listProjects(owner),
    };
  });
};
