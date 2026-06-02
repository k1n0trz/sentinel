import type { Finding, PublicResourceResult } from '@sentinel/shared';
import { nanoid } from 'nanoid';

const checkPublicResource = async (baseUrl: URL, path: string): Promise<PublicResourceResult> => {
  const url = new URL(path, baseUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SentinelPassiveScanner/0.1 defensive-security',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    return {
      url: url.toString(),
      present: response.status >= 200 && response.status < 400,
      status: response.status,
    };
  } catch {
    return {
      url: url.toString(),
      present: false,
    };
  } finally {
    clearTimeout(timeout);
  }
};

export const scanPublicResources = async (baseUrl: URL) => {
  const [robotsTxt, sitemapXml] = await Promise.all([
    checkPublicResource(baseUrl, '/robots.txt'),
    checkPublicResource(baseUrl, '/sitemap.xml'),
  ]);

  const findings: Finding[] = [];

  if (!robotsTxt.present) {
    findings.push({
      id: nanoid(),
      title: 'robots.txt not detected',
      severity: 'info',
      category: 'public-resources',
      description: 'No public robots.txt file was detected during this passive check.',
      recommendation: 'Publish robots.txt when crawler guidance is relevant for this site.',
    });
  }

  if (!sitemapXml.present) {
    findings.push({
      id: nanoid(),
      title: 'sitemap.xml not detected',
      severity: 'info',
      category: 'public-resources',
      description: 'No public sitemap.xml file was detected during this passive check.',
      recommendation: 'Publish sitemap.xml when search discovery and crawl hygiene matter.',
    });
  }

  return {
    robotsTxt,
    sitemapXml,
    findings,
  };
};

