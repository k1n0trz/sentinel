import { z } from 'zod';

const envSchema = z.object({
  API_HOST: z.string().default('0.0.0.0'),
  API_PORT: z.coerce.number().int().positive().optional(),
  DATABASE_URL: z.string().url().optional(),
  FREE_SCAN_DOMAIN_RATE_LIMIT_MAX: z.coerce
    .number()
    .int()
    .positive()
    .default(5),
  FREE_SCAN_DOMAIN_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(600000),
  FREE_SCAN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  FREE_SCAN_RATE_LIMIT_WINDOW: z.string().default('1 minute'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().optional(),
  REDIS_URL: z.string().url().optional(),
});

export const parseEnv = (source: NodeJS.ProcessEnv) => {
  const parsed = envSchema.parse(source);

  return {
    ...parsed,
    API_PORT: parsed.API_PORT ?? parsed.PORT ?? 4100,
  };
};

export const env = parseEnv(process.env);
