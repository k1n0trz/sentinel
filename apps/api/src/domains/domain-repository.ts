import { nanoid } from 'nanoid';
import type { RiskLevel } from '@sentinel/shared';
import { AppError } from '../common/errors.js';
import { prisma } from '../database/prisma.js';

type DomainOwner = {
  email: string;
  name?: string;
};

type LatestScanRow = {
  id: string;
  grade: string | null;
  score: number;
  riskLevel: string;
  createdAt: Date;
};

type DomainRow = {
  id: string;
  hostname: string;
  verified: boolean;
  verificationMethod: string | null;
  verificationToken: string | null;
  createdAt: Date;
  scans: LatestScanRow[];
};

type DomainRepositoryClient = {
  domain: {
    create?: (args: unknown) => Promise<DomainRow>;
    findFirst?: (args: unknown) => Promise<DomainRow | null>;
    findMany?: (args: unknown) => Promise<DomainRow[]>;
  };
  project: {
    create?: (args: unknown) => Promise<{ id: string }>;
    findFirst?: (args: unknown) => Promise<{ id: string } | null>;
  };
  user: {
    upsert?: (args: unknown) => Promise<{ id: string }>;
  };
};

type DomainRepositoryDependencies = {
  client?: DomainRepositoryClient;
  databaseUrl?: string;
  tokenFactory?: () => string;
};

export type UserDomain = {
  id: string;
  hostname: string;
  verified: boolean;
  verificationMethod?: string;
  verificationToken?: string;
  createdAt: string;
  latestScan?: {
    id: string;
    grade?: string;
    score: number;
    riskLevel: RiskLevel;
    createdAt: string;
  };
};

const domainSelect = {
  createdAt: true,
  hostname: true,
  id: true,
  scans: {
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      createdAt: true,
      grade: true,
      id: true,
      riskLevel: true,
      score: true,
    },
    take: 1,
  },
  verificationMethod: true,
  verificationToken: true,
  verified: true,
} as const;

const defaultProjectName = 'Default workspace';

const dbRiskLevelToApiRiskLevel = (riskLevel: string): RiskLevel => {
  const normalized = riskLevel.toLowerCase();

  if (normalized === 'secure') return 'Secure';
  if (normalized === 'good') return 'Good';
  if (normalized === 'warning') return 'Warning';
  if (normalized === 'risky') return 'Risky';
  return 'Critical';
};

const dependenciesOrDefault = (dependencies: DomainRepositoryDependencies) => {
  const databaseUrl = dependencies.databaseUrl ?? process.env.DATABASE_URL;

  if (!dependencies.client && !databaseUrl) {
    throw new AppError('Domain repository is not configured.', 503);
  }

  return (dependencies.client ?? prisma) as DomainRepositoryClient;
};

export const normalizeDomainHostname = (value: string) => {
  const trimmed = value.trim().toLowerCase();

  if (!trimmed) {
    throw new AppError('Enter a valid domain or HTTP/HTTPS URL.', 400);
  }

  try {
    const parsed = new URL(
      /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );

    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
      throw new Error('Unsupported protocol');
    }

    return parsed.hostname;
  } catch {
    throw new AppError('Enter a valid domain or HTTP/HTTPS URL.', 400);
  }
};

const domainRowToUserDomain = (row: DomainRow): UserDomain => {
  const latestScan = row.scans[0];

  return {
    id: row.id,
    hostname: row.hostname,
    verified: row.verified,
    ...(row.verificationMethod
      ? { verificationMethod: row.verificationMethod }
      : {}),
    ...(row.verificationToken ? { verificationToken: row.verificationToken } : {}),
    createdAt: row.createdAt.toISOString(),
    ...(latestScan
      ? {
          latestScan: {
            id: latestScan.id,
            ...(latestScan.grade ? { grade: latestScan.grade } : {}),
            score: latestScan.score,
            riskLevel: dbRiskLevelToApiRiskLevel(latestScan.riskLevel),
            createdAt: latestScan.createdAt.toISOString(),
          },
        }
      : {}),
  };
};

const ensureUser = async (
  owner: DomainOwner,
  client: DomainRepositoryClient,
) =>
  client.user.upsert
    ? client.user.upsert({
        create: {
          email: owner.email,
          name: owner.name,
        },
        update: {
          name: owner.name,
        },
        where: {
          email: owner.email,
        },
      })
    : Promise.reject(new AppError('User repository is unavailable.', 503));

const ensureDefaultProject = async (
  owner: DomainOwner,
  client: DomainRepositoryClient,
) => {
  const user = await ensureUser(owner, client);
  if (!client.project.findFirst || !client.project.create) {
    throw new AppError('Project repository is unavailable.', 503);
  }

  const existingProject = await client.project.findFirst({
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      id: true,
    },
    where: {
      userId: user.id,
    },
  });

  if (existingProject) {
    return existingProject;
  }

  return client.project.create({
    data: {
      name: defaultProjectName,
      userId: user.id,
    },
    select: {
      id: true,
    },
  });
};

export const listUserDomains = async (
  owner: DomainOwner,
  dependencies: DomainRepositoryDependencies = {},
): Promise<UserDomain[]> => {
  const client = dependenciesOrDefault(dependencies);

  if (!client.domain.findMany) {
    throw new AppError('Domain repository is unavailable.', 503);
  }

  const domains = await client.domain.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: domainSelect,
    where: {
      project: {
        user: {
          email: owner.email,
        },
      },
    },
  });

  return domains.map(domainRowToUserDomain);
};

export const createUserDomain = async (
  owner: DomainOwner,
  value: string,
  dependencies: DomainRepositoryDependencies = {},
): Promise<UserDomain> => {
  const client = dependenciesOrDefault(dependencies);
  const hostname = normalizeDomainHostname(value);
  const project = await ensureDefaultProject(owner, client);

  if (!client.domain.findFirst || !client.domain.create) {
    throw new AppError('Domain repository is unavailable.', 503);
  }

  const existingDomain = await client.domain.findFirst({
    select: domainSelect,
    where: {
      hostname,
      projectId: project.id,
    },
  });

  if (existingDomain) {
    return domainRowToUserDomain(existingDomain);
  }

  const token = dependencies.tokenFactory?.() ?? nanoid(32);
  const domain = await client.domain.create({
    data: {
      hostname,
      projectId: project.id,
      verificationMethod: 'dns-txt',
      verificationToken: `sentinel-verify=${token}`,
    },
    select: domainSelect,
  });

  return domainRowToUserDomain(domain);
};
