import { NextRequest, NextResponse } from 'next/server';

const APP_SUBDOMAINS = new Set(['app.sentinelcloud.dev']);
const PUBLIC_FILE = /\.(.*)$/;

function isAllowedAppSubdomainPath(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/app') ||
    pathname.startsWith('/login') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    PUBLIC_FILE.test(pathname)
  );
}

export function middleware(request: NextRequest) {
  const host = (request.headers.get('host')?.split(':')[0] ?? '').toLowerCase();

  if (!APP_SUBDOMAINS.has(host)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/app';
    return NextResponse.redirect(url);
  }

  if (isAllowedAppSubdomainPath(pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/app';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
