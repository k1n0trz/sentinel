import { AppError } from './errors.js';

const allowedProtocols = new Set(['http:', 'https:']);

export const normalizeTargetUrl = (rawUrl: string): URL => {
  const parsed = new URL(rawUrl);

  if (!allowedProtocols.has(parsed.protocol)) {
    throw new AppError('Only HTTP and HTTPS URLs are supported.', 400);
  }

  parsed.hash = '';
  parsed.username = '';
  parsed.password = '';

  return parsed;
};

