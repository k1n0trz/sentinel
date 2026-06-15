import { AppError } from '../common/errors.js';
import { prisma } from '../database/prisma.js';

type ProjectOwner = {
  email: string;
  name?: string;
};

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  domains: Array<{
    id: string;
    scans: Array<{
      score: number;
    }>;
  }>;
};

type ProjectRepositoryClient = {
  project: {
    findMany?: (args: unknown) => Promise<ProjectRow[]>;
  };
};

type ProjectRepositoryDependencies = {
  client?: ProjectRepositoryClient;
  databaseUrl?: string;
};

export type UserProject = {
  id: string;
  name: string;
  description?: string;
  domainCount: number;
  averageScore?: number;
  createdAt: string;
};

const projectSelect = {
  createdAt: true,
  description: true,
  domains: {
    select: {
      id: true,
      scans: {
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          score: true,
        },
        take: 1,
      },
    },
  },
  id: true,
  name: true,
} as const;

const dependenciesOrDefault = (dependencies: ProjectRepositoryDependencies) => {
  const databaseUrl = dependencies.databaseUrl ?? process.env.DATABASE_URL;

  if (!dependencies.client && !databaseUrl) {
    throw new AppError('Project repository is not configured.', 503);
  }

  return (dependencies.client ?? prisma) as ProjectRepositoryClient;
};

const projectRowToUserProject = (row: ProjectRow): UserProject => {
  const scores = row.domains
    .map((domain) => domain.scans[0]?.score)
    .filter((score): score is number => typeof score === 'number');
  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : undefined;

  return {
    id: row.id,
    name: row.name,
    ...(row.description ? { description: row.description } : {}),
    domainCount: row.domains.length,
    ...(typeof averageScore === 'number' ? { averageScore } : {}),
    createdAt: row.createdAt.toISOString(),
  };
};

export const listUserProjects = async (
  owner: ProjectOwner,
  dependencies: ProjectRepositoryDependencies = {},
): Promise<UserProject[]> => {
  const client = dependenciesOrDefault(dependencies);

  if (!client.project.findMany) {
    throw new AppError('Project repository is unavailable.', 503);
  }

  const projects = await client.project.findMany({
    orderBy: {
      createdAt: 'asc',
    },
    select: projectSelect,
    where: {
      user: {
        email: owner.email,
      },
    },
  });

  return projects.map(projectRowToUserProject);
};
