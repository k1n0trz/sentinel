import { NextResponse } from 'next/server';

type ProxyOptions = {
  body?: BodyInit;
  method: 'GET' | 'POST';
  path: string;
};

const jsonHeaders = {
  'Content-Type': 'application/json',
};

const upstreamUrl = (path: string) => {
  const apiUrl = process.env.SENTINEL_API_URL;

  if (!apiUrl) return null;

  try {
    return new URL(path, apiUrl);
  } catch {
    return null;
  }
};

export const proxyPublicApi = async ({ body, method, path }: ProxyOptions) => {
  const url = upstreamUrl(path);

  if (!url) {
    return NextResponse.json(
      { error: 'Public scan service is not configured.' },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(url, {
      body,
      cache: 'no-store',
      headers: method === 'POST' ? jsonHeaders : undefined,
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
      { error: 'Public scan service is temporarily unavailable.' },
      { status: 502 },
    );
  }
};
