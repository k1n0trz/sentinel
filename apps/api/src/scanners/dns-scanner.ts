import { resolve4, resolveMx, resolveNs } from 'node:dns/promises';
import { isIP } from 'node:net';
import type { DnsResult, Finding } from '@sentinel/shared';
import { nanoid } from 'nanoid';

export const scanDns = async (hostname: string) => {
  if (isIP(hostname)) {
    return {
      dns: {
        hostname,
        addresses: [hostname],
        mx: [],
        ns: [],
      },
      findings: [],
    };
  }

  const [addresses, mxRecords, nsRecords] = await Promise.allSettled([
    resolve4(hostname),
    resolveMx(hostname),
    resolveNs(hostname),
  ]);

  const dns: DnsResult = {
    hostname,
    addresses: addresses.status === 'fulfilled' ? addresses.value : [],
    mx: mxRecords.status === 'fulfilled' ? mxRecords.value.map((record) => record.exchange) : [],
    ns: nsRecords.status === 'fulfilled' ? nsRecords.value : [],
  };

  const findings: Finding[] = [];

  if (dns.addresses.length === 0) {
    findings.push({
      id: nanoid(),
      title: 'No A records resolved',
      severity: 'medium',
      category: 'dns',
      description: 'The target hostname did not resolve to IPv4 addresses during this passive check.',
      recommendation: 'Verify DNS configuration and public availability for the hostname.',
    });
  }

  if (dns.ns.length === 0) {
    findings.push({
      id: nanoid(),
      title: 'No nameservers resolved',
      severity: 'low',
      category: 'dns',
      description: 'No NS records were resolved for this hostname.',
      recommendation: 'Confirm authoritative nameserver records are correctly published.',
    });
  }

  return { dns, findings };
};
