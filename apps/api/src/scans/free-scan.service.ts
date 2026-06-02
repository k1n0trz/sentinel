import { freeScanRequestSchema, scoreToGrade, type Finding, type ScanResult } from '@sentinel/shared';
import { nanoid } from 'nanoid';
import { normalizeTargetUrl } from '../common/url.js';
import { scanDomain } from '../scanners/domain-scanner.js';
import { scanDns } from '../scanners/dns-scanner.js';
import { scanPublicResources } from '../scanners/public-resource-scanner.js';
import { scanSecurityHeaders } from '../scanners/security-headers-scanner.js';
import { scanSsl } from '../scanners/ssl-scanner.js';
import { calculateScore } from '../scoring/scoring.service.js';
import { persistScan } from './scan-persistence.js';
import { saveScan } from './scan-store.js';

export const runFreeScan = async (
  input: unknown,
  options: { public: boolean } = { public: false },
): Promise<ScanResult> => {
  const { followRedirects, hideFromPublicResults, url } = freeScanRequestSchema.parse(input);
  const targetUrl = normalizeTargetUrl(url);
  const findings: Finding[] = [];

  const domain = await scanDomain(targetUrl, { followRedirects });
  const finalUrl = domain.finalUrl;
  const response = domain.response;
  const rawHeaders = response
    ? Array.from(response.headers.entries()).map(([name, value]) => ({ name, value }))
    : [];
  const securityHeaders = response
    ? scanSecurityHeaders(response.headers)
    : { headers: [], findings: [] };
  const [ssl, dns, publicResources] = await Promise.all([
    scanSsl(finalUrl),
    scanDns(finalUrl.hostname),
    scanPublicResources(finalUrl),
  ]);

  findings.push(
    ...domain.findings,
    ...securityHeaders.findings,
    ...ssl.findings,
    ...dns.findings,
    ...publicResources.findings,
  );

  if (!followRedirects && response && response.status >= 300 && response.status < 400) {
    findings.push({
      id: nanoid(),
      title: 'Redirect not followed',
      severity: 'info',
      category: 'domain',
      description: `The target returned HTTP ${response.status}; redirect following was disabled for this scan.`,
      recommendation: 'Enable redirect following when you want Sentinel to evaluate the final destination.',
    });
  }

  const calculated = calculateScore(findings);
  const score = response ? calculated.score : 0;
  const riskLevel = response ? calculated.riskLevel : 'Critical';
  const grade = scoreToGrade(score, !response);

  const visibility = {
    public: options.public,
    hiddenFromPublicResults: hideFromPublicResults,
  };

  const scan = saveScan({
    id: nanoid(),
    targetUrl: targetUrl.toString(),
    finalUrl: finalUrl.toString(),
    status: 'completed',
    httpStatus: domain.httpStatus,
    https: finalUrl.protocol === 'https:',
    score,
    grade,
    riskLevel,
    headers: securityHeaders.headers,
    ssl: ssl.ssl,
    dns: dns.dns,
    metadata: {
      responseTimeMs: domain.responseTimeMs,
      redirectChain: domain.redirectChain,
      rawHeaders,
      robotsTxt: publicResources.robotsTxt,
      sitemapXml: publicResources.sitemapXml,
    },
    findings,
    createdAt: new Date().toISOString(),
  }, visibility);

  await persistScan(scan, visibility);

  return scan;
};
