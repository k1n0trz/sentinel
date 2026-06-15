import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const SESSION_COOKIE_NAME = '__session';
export const SESSION_COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 5;
export const SESSION_COOKIE_MAX_AGE_SECONDS = SESSION_COOKIE_MAX_AGE_MS / 1000;
const SESSION_ISSUER = 'sentinel-web';
const SESSION_AUDIENCE = 'sentinel-dashboard';

export type CurrentUser = {
  email?: string;
  name?: string;
  picture?: string;
  uid: string;
};

const optionalString = (value: unknown) =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

const sessionSecret = () => {
  const configuredSecret = process.env.SENTINEL_SESSION_SECRET;

  if (configuredSecret) {
    return new TextEncoder().encode(configuredSecret);
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SENTINEL_SESSION_SECRET is not configured.');
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    'sentinel-local-dev';

  return new TextEncoder().encode(`local-dev-session-secret:${projectId}`);
};

export async function createSessionToken(user: CurrentUser) {
  const { SignJWT } = await import('jose');

  return new SignJWT({
    email: user.email,
    name: user.name,
    picture: user.picture,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience(SESSION_AUDIENCE)
    .setExpirationTime(`${SESSION_COOKIE_MAX_AGE_SECONDS}s`)
    .setIssuedAt()
    .setIssuer(SESSION_ISSUER)
    .setSubject(user.uid)
    .sign(sessionSecret());
}

export async function verifySessionToken(
  sessionCookie: string,
): Promise<CurrentUser | null> {
  const { jwtVerify } = await import('jose');
  const { payload } = await jwtVerify(sessionCookie, sessionSecret(), {
    audience: SESSION_AUDIENCE,
    issuer: SESSION_ISSUER,
  });

  if (!payload.sub) {
    return null;
  }

  return {
    email: optionalString(payload.email),
    name: optionalString(payload.name),
    picture: optionalString(payload.picture),
    uid: payload.sub,
  };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    return await verifySessionToken(sessionCookie);
  } catch {
    return null;
  }
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?next=/app');
  }

  return user;
}
