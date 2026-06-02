import { z } from 'zod';

export const severitySchema = z.enum(['critical', 'high', 'medium', 'low', 'info']);
export type Severity = z.infer<typeof severitySchema>;

export const riskLevelSchema = z.enum(['Secure', 'Good', 'Warning', 'Risky', 'Critical']);
export type RiskLevel = z.infer<typeof riskLevelSchema>;

export const scanStatusSchema = z.enum(['queued', 'running', 'completed', 'failed']);
export type ScanStatus = z.infer<typeof scanStatusSchema>;

export const scanGradeSchema = z.enum(['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'R']);
export type ScanGrade = z.infer<typeof scanGradeSchema>;

export const freeScanRequestSchema = z.object({
  url: z.string().url().max(2048),
  followRedirects: z.boolean().default(true),
  hideFromPublicResults: z.boolean().default(false),
});
export type FreeScanRequest = z.infer<typeof freeScanRequestSchema>;

export const findingSchema = z.object({
  id: z.string(),
  title: z.string(),
  severity: severitySchema,
  category: z.string(),
  description: z.string(),
  recommendation: z.string(),
});
export type Finding = z.infer<typeof findingSchema>;

export const securityHeaderStatusSchema = z.enum(['present', 'missing', 'weak', 'misconfigured']);
export type SecurityHeaderStatus = z.infer<typeof securityHeaderStatusSchema>;

export const securityHeaderResultSchema = z.object({
  name: z.string(),
  present: z.boolean(),
  status: securityHeaderStatusSchema,
  severity: severitySchema.optional(),
  value: z.string().optional(),
  risk: z.string().optional(),
  recommendation: z.string().optional(),
});
export type SecurityHeaderResult = z.infer<typeof securityHeaderResultSchema>;

export const sslResultSchema = z.object({
  enabled: z.boolean(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  issuer: z.string().optional(),
  subject: z.string().optional(),
  daysRemaining: z.number().optional(),
});
export type SslResult = z.infer<typeof sslResultSchema>;

export const dnsResultSchema = z.object({
  hostname: z.string(),
  addresses: z.array(z.string()),
  mx: z.array(z.string()),
  ns: z.array(z.string()),
});
export type DnsResult = z.infer<typeof dnsResultSchema>;

export const redirectHopSchema = z.object({
  from: z.string(),
  to: z.string(),
  status: z.number(),
});
export type RedirectHop = z.infer<typeof redirectHopSchema>;

export const publicResourceResultSchema = z.object({
  url: z.string(),
  present: z.boolean(),
  status: z.number().optional(),
});
export type PublicResourceResult = z.infer<typeof publicResourceResultSchema>;

export const passiveMetadataSchema = z.object({
  responseTimeMs: z.number().optional(),
  redirectChain: z.array(redirectHopSchema),
  robotsTxt: publicResourceResultSchema.optional(),
  sitemapXml: publicResourceResultSchema.optional(),
});
export type PassiveMetadata = z.infer<typeof passiveMetadataSchema>;

export const scanResultSchema = z.object({
  id: z.string(),
  targetUrl: z.string(),
  finalUrl: z.string().optional(),
  status: scanStatusSchema,
  httpStatus: z.number().optional(),
  https: z.boolean(),
  score: z.number().min(0).max(100),
  grade: scanGradeSchema,
  riskLevel: riskLevelSchema,
  headers: z.array(securityHeaderResultSchema),
  ssl: sslResultSchema.optional(),
  dns: dnsResultSchema.optional(),
  metadata: passiveMetadataSchema.optional(),
  findings: z.array(findingSchema),
  createdAt: z.string(),
});
export type ScanResult = z.infer<typeof scanResultSchema>;

export const scoreToRiskLevel = (score: number): RiskLevel => {
  if (score >= 90) return 'Secure';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Warning';
  if (score >= 25) return 'Risky';
  return 'Critical';
};

export const scoreToGrade = (score: number, hasHttpFailure = false): ScanGrade => {
  if (hasHttpFailure) return 'R';
  if (score >= 97) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  if (score >= 50) return 'E';
  return 'F';
};
