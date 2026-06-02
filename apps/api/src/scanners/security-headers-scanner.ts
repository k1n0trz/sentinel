import type { Finding, SecurityHeaderResult, SecurityHeaderStatus, Severity } from '@sentinel/shared';
import { nanoid } from 'nanoid';

type HeaderRule = {
  name: string;
  missingSeverity: Severity;
  missingRisk: string;
  missingRecommendation: string;
  evaluate?: (value: string) => Omit<SecurityHeaderResult, 'name' | 'present' | 'value'> | undefined;
};

const includesDirective = (value: string, directive: string) =>
  value
    .toLowerCase()
    .split(';')
    .map((part) => part.trim())
    .some((part) => part.startsWith(directive.toLowerCase()));

const getDirective = (value: string, directive: string) =>
  value
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.toLowerCase().startsWith(directive.toLowerCase()));

const evaluateCsp = (value: string) => {
  const normalized = value.toLowerCase();
  const issues: string[] = [];

  if (!includesDirective(value, 'default-src')) issues.push('missing default-src');
  if (normalized.includes("'unsafe-inline'")) issues.push('allows unsafe-inline');
  if (normalized.includes("'unsafe-eval'")) issues.push('allows unsafe-eval');
  if (normalized.includes('*')) issues.push('uses wildcard sources');
  if (normalized.includes('http:')) issues.push('allows plain HTTP sources');

  if (issues.length === 0) return undefined;

  return {
    status: normalized.includes("'unsafe-eval'") || normalized.includes("'unsafe-inline'")
      ? 'misconfigured'
      : 'weak',
    severity: normalized.includes("'unsafe-eval'") ? 'high' : 'medium',
    risk: `Content-Security-Policy is present but ${issues.join(', ')}.`,
    recommendation:
      'Tighten CSP with explicit source lists, start with Report-Only if needed, and remove unsafe-inline/unsafe-eval wherever possible.',
  } satisfies Omit<SecurityHeaderResult, 'name' | 'present' | 'value'>;
};

const evaluateHsts = (value: string) => {
  const normalized = value.toLowerCase();
  const maxAge = Number(getDirective(normalized, 'max-age')?.split('=')[1] ?? 0);
  const issues: string[] = [];

  if (!Number.isFinite(maxAge) || maxAge < 15552000) issues.push('max-age is below 180 days');
  if (!normalized.includes('includesubdomains')) issues.push('includeSubDomains is missing');
  if (!normalized.includes('preload')) issues.push('preload is missing');

  if (issues.length === 0) return undefined;

  return {
    status: 'weak',
    severity: maxAge < 86400 ? 'high' : 'medium',
    risk: `Strict-Transport-Security is present but ${issues.join(', ')}.`,
    recommendation:
      'Use a long HSTS max-age, include subdomains when safe, and add preload only after verifying all subdomains support HTTPS.',
  } satisfies Omit<SecurityHeaderResult, 'name' | 'present' | 'value'>;
};

const evaluateXFrameOptions = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (['deny', 'sameorigin'].includes(normalized)) return undefined;

  return {
    status: 'misconfigured',
    severity: 'medium',
    risk: 'X-Frame-Options is present with an invalid or obsolete value.',
    recommendation: 'Use DENY or SAMEORIGIN, or replace this control with a frame-ancestors CSP directive.',
  } satisfies Omit<SecurityHeaderResult, 'name' | 'present' | 'value'>;
};

const evaluateXContentTypeOptions = (value: string) => {
  if (value.trim().toLowerCase() === 'nosniff') return undefined;

  return {
    status: 'misconfigured',
    severity: 'medium',
    risk: 'X-Content-Type-Options is present but does not use nosniff.',
    recommendation: 'Set X-Content-Type-Options to nosniff to reduce MIME sniffing risks.',
  } satisfies Omit<SecurityHeaderResult, 'name' | 'present' | 'value'>;
};

const evaluateReferrerPolicy = (value: string) => {
  const normalized = value.trim().toLowerCase();
  const strong = new Set(['no-referrer', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin']);

  if (strong.has(normalized)) return undefined;

  return {
    status: normalized === 'unsafe-url' ? 'misconfigured' : 'weak',
    severity: normalized === 'unsafe-url' ? 'medium' : 'low',
    risk: 'Referrer-Policy may expose more URL information than necessary.',
    recommendation: 'Prefer strict-origin-when-cross-origin for a balanced default, or no-referrer for stricter privacy.',
  } satisfies Omit<SecurityHeaderResult, 'name' | 'present' | 'value'>;
};

const evaluatePermissionsPolicy = (value: string) => {
  if (value.trim().length > 0 && !value.includes('*')) return undefined;

  return {
    status: value.trim().length === 0 ? 'misconfigured' : 'weak',
    severity: 'low',
    risk: 'Permissions-Policy is empty or too permissive.',
    recommendation: 'Explicitly disable or scope sensitive browser capabilities such as camera, microphone and geolocation.',
  } satisfies Omit<SecurityHeaderResult, 'name' | 'present' | 'value'>;
};

const evaluateCoop = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (['same-origin', 'same-origin-allow-popups'].includes(normalized)) return undefined;

  return {
    status: 'weak',
    severity: 'low',
    risk: 'Cross-Origin-Opener-Policy is present but may not isolate browsing contexts strongly.',
    recommendation: 'Use same-origin unless the application explicitly needs a looser opener policy.',
  } satisfies Omit<SecurityHeaderResult, 'name' | 'present' | 'value'>;
};

const evaluateCorp = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (['same-origin', 'same-site', 'cross-origin'].includes(normalized)) return undefined;

  return {
    status: 'misconfigured',
    severity: 'low',
    risk: 'Cross-Origin-Resource-Policy has an unrecognized value.',
    recommendation: 'Use same-origin, same-site, or cross-origin according to the resource sharing model.',
  } satisfies Omit<SecurityHeaderResult, 'name' | 'present' | 'value'>;
};

const evaluateCoep = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (['require-corp', 'credentialless'].includes(normalized)) return undefined;

  return {
    status: 'misconfigured',
    severity: 'low',
    risk: 'Cross-Origin-Embedder-Policy has an unrecognized value.',
    recommendation: 'Use require-corp or credentialless only when the application can support cross-origin isolation.',
  } satisfies Omit<SecurityHeaderResult, 'name' | 'present' | 'value'>;
};

const headerRules: HeaderRule[] = [
  {
    name: 'Content-Security-Policy',
    missingSeverity: 'high',
    missingRisk: 'The site is missing a primary browser control against XSS and content injection.',
    missingRecommendation:
      'Add a tested CSP. Start with Content-Security-Policy-Report-Only if the app needs tuning before enforcement.',
    evaluate: evaluateCsp,
  },
  {
    name: 'Strict-Transport-Security',
    missingSeverity: 'high',
    missingRisk: 'Browsers are not instructed to force future HTTPS connections for this host.',
    missingRecommendation: 'Add HSTS after confirming HTTPS works reliably across the domain and required subdomains.',
    evaluate: evaluateHsts,
  },
  {
    name: 'X-Frame-Options',
    missingSeverity: 'medium',
    missingRisk: 'The site may be easier to embed in hostile frames, increasing clickjacking risk.',
    missingRecommendation: 'Set X-Frame-Options to DENY or SAMEORIGIN, or configure frame-ancestors in CSP.',
    evaluate: evaluateXFrameOptions,
  },
  {
    name: 'X-Content-Type-Options',
    missingSeverity: 'medium',
    missingRisk: 'Browsers may MIME-sniff resources, increasing exposure to content type confusion.',
    missingRecommendation: 'Set X-Content-Type-Options to nosniff.',
    evaluate: evaluateXContentTypeOptions,
  },
  {
    name: 'Referrer-Policy',
    missingSeverity: 'medium',
    missingRisk: 'Outbound requests may leak more URL context than necessary.',
    missingRecommendation: 'Set Referrer-Policy to strict-origin-when-cross-origin or a stricter policy.',
    evaluate: evaluateReferrerPolicy,
  },
  {
    name: 'Permissions-Policy',
    missingSeverity: 'medium',
    missingRisk: 'Sensitive browser capabilities are not explicitly limited.',
    missingRecommendation: 'Add a Permissions-Policy that disables or scopes camera, microphone, geolocation and payment.',
    evaluate: evaluatePermissionsPolicy,
  },
  {
    name: 'Cross-Origin-Opener-Policy',
    missingSeverity: 'low',
    missingRisk: 'The site is missing an isolation signal for top-level browsing contexts.',
    missingRecommendation: 'Consider Cross-Origin-Opener-Policy: same-origin for stronger cross-origin isolation.',
    evaluate: evaluateCoop,
  },
  {
    name: 'Cross-Origin-Resource-Policy',
    missingSeverity: 'low',
    missingRisk: 'Resource sharing boundaries are not declared for cross-origin consumers.',
    missingRecommendation: 'Consider Cross-Origin-Resource-Policy based on whether resources should be same-origin, same-site or public.',
    evaluate: evaluateCorp,
  },
  {
    name: 'Cross-Origin-Embedder-Policy',
    missingSeverity: 'low',
    missingRisk: 'The site is not declaring embedder policy for cross-origin isolation.',
    missingRecommendation: 'Use COEP only if your app needs cross-origin isolation features and dependencies support it.',
    evaluate: evaluateCoep,
  },
];

const findingTitle = (status: SecurityHeaderStatus, name: string) => {
  if (status === 'missing') return `Missing ${name}`;
  if (status === 'weak') return `Weak ${name}`;
  return `Misconfigured ${name}`;
};

export const scanSecurityHeaders = (headers: Headers) => {
  const results: SecurityHeaderResult[] = headerRules.map((rule) => {
    const value = headers.get(rule.name);

    if (!value) {
      return {
        name: rule.name,
        present: false,
        status: 'missing',
        severity: rule.missingSeverity,
        risk: rule.missingRisk,
        recommendation: rule.missingRecommendation,
      };
    }

    const evaluation = rule.evaluate?.(value);

    return {
      name: rule.name,
      present: true,
      status: evaluation?.status ?? 'present',
      severity: evaluation?.severity,
      value,
      risk: evaluation?.risk,
      recommendation: evaluation?.recommendation,
    };
  });

  const findings: Finding[] = results
    .filter((header) => header.status !== 'present')
    .map((header) => ({
      id: nanoid(),
      title: findingTitle(header.status, header.name),
      severity: header.severity ?? 'info',
      category: 'security-headers',
      description:
        header.risk ??
        `${header.name} was evaluated as ${header.status}.`,
      recommendation: header.recommendation ?? `Review ${header.name} configuration.`,
    }));

  return { findings, headers: results };
};

