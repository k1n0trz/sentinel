import type { Finding, RedirectHop } from '@sentinel/shared';
import { nanoid } from 'nanoid';
import { AppError } from '../common/errors.js';
import { normalizeTargetUrl } from '../common/url.js';

const redirectStatuses = new Set([301, 302, 303, 307, 308]);
const maxRedirects = 8;

export type DomainScanOptions = {
  followRedirects: boolean;
};

export type DomainScanResult = {
  response?: Response;
  finalUrl: URL;
  httpStatus?: number;
  responseTimeMs?: number;
  redirectChain: RedirectHop[];
  findings: Finding[];
};

export const scanDomain = async (
  targetUrl: URL,
  options: DomainScanOptions,
): Promise<DomainScanResult> => {
  const startedAt = Date.now();
  const findings: Finding[] = [];
  const redirectChain: RedirectHop[] = [];
  let currentUrl = targetUrl;
  let response: Response | undefined;

  for (let attempt = 0; attempt <= maxRedirects; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      response = await fetch(currentUrl, {
        headers: {
          'User-Agent': 'SentinelPassiveScanner/0.1 defensive-security',
        },
        redirect: 'manual',
        signal: controller.signal,
      });
    } catch (error) {
      findings.push({
        id: nanoid(),
        title: 'HTTP request failed',
        severity: 'medium',
        category: 'domain',
        description: error instanceof Error ? error.message : 'The target could not be reached.',
        recommendation: 'Confirm the target is publicly reachable and accepts standard HTTP requests.',
      });

      return {
        finalUrl: currentUrl,
        responseTimeMs: Date.now() - startedAt,
        redirectChain,
        findings,
      };
    } finally {
      clearTimeout(timeout);
    }

    if (!options.followRedirects || !redirectStatuses.has(response.status)) {
      break;
    }

    const location = response.headers.get('location');

    if (!location) {
      findings.push({
        id: nanoid(),
        title: 'Redirect without location',
        severity: 'low',
        category: 'domain',
        description: `The target returned HTTP ${response.status} without a Location header.`,
        recommendation: 'Ensure redirects include a valid Location header.',
      });
      break;
    }

    const nextUrl = normalizeTargetUrl(new URL(location, currentUrl).toString());

    redirectChain.push({
      from: currentUrl.toString(),
      to: nextUrl.toString(),
      status: response.status,
    });

    currentUrl = nextUrl;
  }

  if (redirectChain.length > maxRedirects) {
    throw new AppError('Too many redirects while scanning the target.', 400);
  }

  if (response && response.status >= 400) {
    findings.push({
      id: nanoid(),
      title: 'HTTP error status returned',
      severity: response.status >= 500 ? 'medium' : 'low',
      category: 'domain',
      description: `The target returned HTTP ${response.status}.`,
      recommendation: 'Review application availability and expected response behavior.',
    });
  }

  if (targetUrl.protocol === 'http:' && currentUrl.protocol !== 'https:') {
    findings.push({
      id: nanoid(),
      title: 'HTTP does not redirect to HTTPS',
      severity: 'high',
      category: 'domain',
      description: 'The initial HTTP URL did not end on an HTTPS URL during this passive scan.',
      recommendation: 'Force HTTP to HTTPS redirects at the edge or web server.',
    });
  }

  if (redirectChain.length > 4) {
    findings.push({
      id: nanoid(),
      title: 'Long redirect chain',
      severity: 'low',
      category: 'domain',
      description: `The target required ${redirectChain.length} redirect hop(s).`,
      recommendation: 'Reduce redirect hops to improve performance and reduce configuration drift.',
    });
  }

  return {
    response,
    finalUrl: currentUrl,
    httpStatus: response?.status,
    responseTimeMs: Date.now() - startedAt,
    redirectChain,
    findings,
  };
};

