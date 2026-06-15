import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { listUserProjects } from './project-repository.js';

const owner = {
  email: 'owner@example.com',
  name: 'Owner Example',
};

describe('listUserProjects', () => {
  it('returns projects owned by the user with domain counts and average score', async () => {
    let query: unknown;
    const client = {
      project: {
        findMany: async (args: unknown) => {
          query = args;
          return [
            {
              id: 'project_1',
              name: 'Default workspace',
              description: null,
              createdAt: new Date('2026-06-15T01:00:00.000Z'),
              domains: [
                {
                  id: 'domain_1',
                  scans: [{ score: 80 }],
                },
                {
                  id: 'domain_2',
                  scans: [{ score: 100 }],
                },
              ],
            },
          ];
        },
      },
    };

    assert.deepEqual(await listUserProjects(owner, { client }), [
      {
        id: 'project_1',
        name: 'Default workspace',
        domainCount: 2,
        averageScore: 90,
        createdAt: '2026-06-15T01:00:00.000Z',
      },
    ]);
    assert.deepEqual(query, {
      orderBy: {
        createdAt: 'asc',
      },
      select: {
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
      },
      where: {
        user: {
          email: owner.email,
        },
      },
    });
  });
});
