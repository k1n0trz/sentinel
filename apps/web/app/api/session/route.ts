import { NextResponse } from 'next/server';

import {
  createSessionToken,
  SESSION_COOKIE_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
} from '../../../lib/auth/session';
import { verifyFirebaseIdToken } from '../../../lib/auth/firebase-token';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const { idToken } = (await request.json()) as { idToken?: string };

  if (!idToken) {
    return NextResponse.json({ error: 'Missing Firebase ID token.' }, { status: 400 });
  }

  let decodedToken;

  try {
    decodedToken = await verifyFirebaseIdToken(idToken);
  } catch {
    return NextResponse.json({ error: 'Invalid Firebase ID token.' }, { status: 401 });
  }

  if (!decodedToken.emailVerified) {
    return NextResponse.json({ error: 'Email verification is required.' }, { status: 403 });
  }

  let sessionCookie;

  try {
    sessionCookie = await createSessionToken(decodedToken);
  } catch {
    return NextResponse.json({ error: 'Session service is not configured.' }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
