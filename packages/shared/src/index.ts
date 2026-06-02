import { z } from 'zod';

export const severitySchema = z.enum(['critical', 'high', 'medium', 'low', 'info']);
export type Severity = z.infer<typeof severitySchema>;

export const riskLevelSchema = z.enum(['Secure', 'Good', 'Warning', 'Risky', 'Critical']);
export type RiskLevel = z.infer<typeof riskLevelSchema>;

export const scanStatusSchema = z.enum(['queued', 'running', 'completed', 'failed']);
export type ScanStatus = z.infer<typeof scanStatusSchema>;

export const freeScanRequestSchema = z.object({
  url: z.string().url().max(2048),
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

export const securityHeaderResultSchema = z.object({
  name: z.string(),
  present: z.boolean(),
  value: z.string().optional(),
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

export const scanResultSchema = z.object({
  id: z.string(),
  targetUrl: z.string(),
  finalUrl: z.string().optional(),
  status: scanStatusSchema,
  httpStatus: z.number().optional(),
  https: z.boolean(),
  score: z.number().min(0).max(100),
  riskLevel: riskLevelSchema,
  headers: z.array(securityHeaderResultSchema),
  ssl: sslResultSchema.optional(),
  dns: dnsResultSchema.optional(),
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

