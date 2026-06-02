import { z } from 'zod';

const envSchema = z.object({
  API_HOST: z.string().default('0.0.0.0'),
  API_PORT: z.coerce.number().int().positive().default(4100),
  DATABASE_URL: z.string().url().optional(),
  FREE_SCAN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  FREE_SCAN_RATE_LIMIT_WINDOW: z.string().default('1 minute'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  REDIS_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
