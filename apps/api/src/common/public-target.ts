import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { AppError } from './errors.js';

export type LookupAddress = {
  address: string;
  family: number;
};

export type LookupHost = (hostname: string) => Promise<LookupAddress[]>;

const standardPorts: Record<string, string> = {
  'http:': '80',
  'https:': '443',
};

const normalizeHostname = (hostname: string) =>
  hostname
    .toLowerCase()
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .replace(/\.$/, '');

const parseIpv4 = (address: string) => {
  const parts = address.split('.');

  if (parts.length !== 4) return undefined;

  const octets = parts.map((part) => Number(part));

  if (
    octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)
  ) {
    return undefined;
  }

  return octets as [number, number, number, number];
};

const isPrivateIpv4 = (address: string) => {
  const octets = parseIpv4(address);

  if (!octets) return true;

  const [first, second] = octets;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 192 && second === 0) ||
    (first === 192 && second === 0 && octets[2] === 2) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51 && octets[2] === 100) ||
    (first === 203 && second === 0 && octets[2] === 113) ||
    first >= 224
  );
};

const isPrivateIpv6 = (address: string) => {
  const normalized = address.toLowerCase();
  const mappedIpv4 = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);

  if (mappedIpv4?.[1]) {
    return isPrivateIpv4(mappedIpv4[1]);
  }

  return (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith('ff')
  );
};

const isPublicAddress = (address: string) => {
  const family = isIP(address);

  if (family === 4) return !isPrivateIpv4(address);
  if (family === 6) return !isPrivateIpv6(address);

  return false;
};

const defaultLookupHost: LookupHost = async (hostname) =>
  lookup(hostname, { all: true, verbatim: true });

export const assertPublicScanTarget = async (
  targetUrl: URL,
  lookupHost: LookupHost = defaultLookupHost,
) => {
  const hostname = normalizeHostname(targetUrl.hostname);
  const expectedPort = standardPorts[targetUrl.protocol];

  if (!expectedPort) {
    throw new AppError('Only HTTP and HTTPS URLs are supported.', 400);
  }

  if (targetUrl.port && targetUrl.port !== expectedPort) {
    throw new AppError(
      'Public demo scans only support standard HTTP/HTTPS ports.',
      400,
    );
  }

  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new AppError(
      'Scan targets must resolve to publicly routable addresses.',
      400,
    );
  }

  const directIpFamily = isIP(hostname);
  const addresses = directIpFamily
    ? [{ address: hostname, family: directIpFamily }]
    : await lookupHost(hostname);

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => !isPublicAddress(address))
  ) {
    throw new AppError(
      'Scan targets must resolve to publicly routable addresses.',
      400,
    );
  }
};
