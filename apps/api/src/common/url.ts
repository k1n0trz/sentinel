import { AppError } from './errors.js';

const allowedProtocols = new Set(['http:', 'https:']);
const hasExplicitProtocol = (value: string) => /^[a-z][a-z\d+.-]*:\/\//i.test(value);

export const normalizeTargetUrl = (rawUrl: string): URL => {
  const trimmedUrl = rawUrl.trim();
  const candidateUrl = hasExplicitProtocol(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
  let parsed: URL;

  try {
    parsed = new URL(candidateUrl);
  } catch {
    throw new AppError('Enter a valid domain or HTTP/HTTPS URL.', 400);
  }

  if (!allowedProtocols.has(parsed.protocol)) {
    throw new AppError('Only HTTP and HTTPS URLs are supported.', 400);
  }

  parsed.hash = '';
  parsed.username = '';
  parsed.password = '';

  return parsed;
};
