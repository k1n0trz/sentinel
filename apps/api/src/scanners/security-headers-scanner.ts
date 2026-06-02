import type { Finding, SecurityHeaderResult } from '@sentinel/shared';
import { nanoid } from 'nanoid';

const requiredHeaders = [
  'Content-Security-Policy',
  'Strict-Transport-Security',
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'Cross-Origin-Opener-Policy',
  'Cross-Origin-Resource-Policy',
  'Cross-Origin-Embedder-Policy',
] as const;

export const scanSecurityHeaders = (headers: Headers) => {
  const results: SecurityHeaderResult[] = requiredHeaders.map((name) => {
    const value = headers.get(name);

    return {
      name,
      present: Boolean(value),
      value: value ?? undefined,
      recommendation: value ? undefined : `Add ${name} with a policy suited to this application.`,
    };
  });

  const findings: Finding[] = results
    .filter((header) => !header.present)
    .map((header) => ({
      id: nanoid(),
      title: `Missing ${header.name}`,
      severity: header.name === 'Content-Security-Policy' ? 'high' : 'medium',
      category: 'security-headers',
      description: `${header.name} was not present in the HTTP response.`,
      recommendation: header.recommendation ?? `Configure ${header.name}.`,
    }));

  return { findings, headers: results };
};

