import { NextResponse } from 'next/server';
import { requireCurrentUser } from '../../../../../lib/auth/session';

const internalKeyHeader = 'x-sentinel-internal-key';

export async function GET() {
  await requireCurrentUser();

  const apiUrl = process.env.SENTINEL_API_URL;
  const internalApiKey = process.env.SENTINEL_INTERNAL_API_KEY;

  if (!apiUrl || !internalApiKey) {
    return NextResponse.json(
      { error: 'Private scan history is not configured.' },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(new URL('/internal/scans/recent', apiUrl), {
      cache: 'no-store',
      headers: {
        [internalKeyHeader]: internalApiKey,
      },
    });

    const responseBody = await response.text();
    const contentType = response.headers.get('content-type');

    return new NextResponse(responseBody || null, {
      headers: contentType ? { 'content-type': contentType } : undefined,
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { error: 'Private scan history is temporarily unavailable.' },
      { status: 502 },
    );
  }
}
