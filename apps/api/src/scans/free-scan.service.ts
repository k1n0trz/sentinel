import { freeScanRequestSchema, type Finding, type ScanResult } from '@sentinel/shared';
import { nanoid } from 'nanoid';
import { normalizeTargetUrl } from '../common/url.js';
import { scanDns } from '../scanners/dns-scanner.js';
import { scanSecurityHeaders } from '../scanners/security-headers-scanner.js';
import { scanSsl } from '../scanners/ssl-scanner.js';
import { calculateScore } from '../scoring/scoring.service.js';
import { saveScan } from './scan-store.js';

export const runFreeScan = async (input: unknown): Promise<ScanResult> => {
  const { url } = freeScanRequestSchema.parse(input);
  const targetUrl = normalizeTargetUrl(url);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const findings: Finding[] = [];
  let response: Response | undefined;

  try {
    response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'SentinelPassiveScanner/0.1 defensive-security',
      },
      redirect: 'follow',
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
  } finally {
    clearTimeout(timeout);
  }

  const finalUrl = response ? normalizeTargetUrl(response.url) : targetUrl;
  const securityHeaders = response
    ? scanSecurityHeaders(response.headers)
    : { headers: [], findings: [] };
  const [ssl, dns] = await Promise.all([scanSsl(finalUrl), scanDns(finalUrl.hostname)]);

  findings.push(...securityHeaders.findings, ...ssl.findings, ...dns.findings);

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

  const { score, riskLevel } = calculateScore(findings);

  return saveScan({
    id: nanoid(),
    targetUrl: targetUrl.toString(),
    finalUrl: finalUrl.toString(),
    status: 'completed',
    httpStatus: response?.status,
    https: finalUrl.protocol === 'https:',
    score,
    riskLevel,
    headers: securityHeaders.headers,
    ssl: ssl.ssl,
    dns: dns.dns,
    findings,
    createdAt: new Date().toISOString(),
  });
};

