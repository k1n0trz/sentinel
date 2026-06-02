import tls from 'node:tls';
import type { Finding, SslResult } from '@sentinel/shared';
import { nanoid } from 'nanoid';

export const scanSsl = async (url: URL): Promise<{ ssl: SslResult; findings: Finding[] }> => {
  if (url.protocol !== 'https:') {
    return {
      ssl: { enabled: false },
      findings: [
        {
          id: nanoid(),
          title: 'HTTPS is not enabled',
          severity: 'high',
          category: 'ssl',
          description: 'The target URL is not using HTTPS.',
          recommendation: 'Serve the application over HTTPS with a trusted certificate.',
        },
      ],
    };
  }

  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: url.hostname,
        port: Number(url.port || 443),
        servername: url.hostname,
        rejectUnauthorized: false,
        timeout: 6000,
      },
      () => {
        const certificate = socket.getPeerCertificate();
        const validTo = certificate.valid_to ? new Date(certificate.valid_to) : undefined;
        const validFrom = certificate.valid_from ? new Date(certificate.valid_from) : undefined;
        const daysRemaining = validTo
          ? Math.ceil((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : undefined;

        const findings: Finding[] = [];

        if (!socket.authorized) {
          findings.push({
            id: nanoid(),
            title: 'TLS certificate is not trusted',
            severity: 'high',
            category: 'ssl',
            description: socket.authorizationError?.toString() ?? 'The certificate chain could not be validated.',
            recommendation: 'Install a trusted certificate and verify the full certificate chain.',
          });
        }

        if (typeof daysRemaining === 'number' && daysRemaining < 30) {
          findings.push({
            id: nanoid(),
            title: 'TLS certificate expires soon',
            severity: daysRemaining <= 0 ? 'critical' : 'medium',
            category: 'ssl',
            description: `The TLS certificate has ${daysRemaining} day(s) remaining.`,
            recommendation: 'Renew the certificate before expiration.',
          });
        }

        socket.end();

        resolve({
          ssl: {
            enabled: true,
            validFrom: validFrom?.toISOString(),
            validTo: validTo?.toISOString(),
            issuer: certificate.issuer ? JSON.stringify(certificate.issuer) : undefined,
            subject: certificate.subject ? JSON.stringify(certificate.subject) : undefined,
            daysRemaining,
          },
          findings,
        });
      },
    );

    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        ssl: { enabled: true },
        findings: [
          {
            id: nanoid(),
            title: 'TLS handshake timed out',
            severity: 'medium',
            category: 'ssl',
            description: 'The TLS metadata check timed out.',
            recommendation: 'Verify TLS availability and handshake performance.',
          },
        ],
      });
    });

    socket.on('error', (error) => {
      resolve({
        ssl: { enabled: true },
        findings: [
          {
            id: nanoid(),
            title: 'TLS metadata check failed',
            severity: 'medium',
            category: 'ssl',
            description: error.message,
            recommendation: 'Verify certificate configuration and TLS endpoint availability.',
          },
        ],
      });
    });
  });
};

