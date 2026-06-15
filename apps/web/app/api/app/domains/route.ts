import { NextResponse } from 'next/server';
import { requireCurrentUser } from '../../../../lib/auth/session';

const internalKeyHeader = 'x-sentinel-internal-key';

const userHeaders = (user: Awaited<ReturnType<typeof requireCurrentUser>>) => ({
  'x-sentinel-user-email': user.email ?? '',
  ...(user.name ? { 'x-sentinel-user-name': user.name } : {}),
});

const upstreamUrl = () => {
  const apiUrl = process.env.SENTINEL_API_URL;

  if (!apiUrl) return null;

  return new URL('/internal/domains', apiUrl);
};

async function proxyDomainsRequest(method: 'GET' | 'POST', body?: string) {
  const user = await requireCurrentUser();
  const apiUrl = upstreamUrl();
  const internalApiKey = process.env.SENTINEL_INTERNAL_API_KEY;

  if (!user.email) {
    return NextResponse.json(
      { error: 'Email is required for domain management.' },
      { status: 400 },
    );
  }

  if (!apiUrl || !internalApiKey) {
    return NextResponse.json(
      { error: 'Domain management is not configured.' },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(apiUrl, {
      body,
      cache: 'no-store',
      headers: {
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
        [internalKeyHeader]: internalApiKey,
        ...userHeaders(user),
      },
      method,
    });

    const responseBody = await response.text();
    const contentType = response.headers.get('content-type');

    return new NextResponse(responseBody || null, {
      headers: contentType ? { 'content-type': contentType } : undefined,
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { error: 'Domain management is temporarily unavailable.' },
      { status: 502 },
    );
  }
}

export async function GET() {
  return proxyDomainsRequest('GET');
}

export async function POST(request: Request) {
  return proxyDomainsRequest('POST', await request.text());
}
