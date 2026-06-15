import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { URL } from 'node:url';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const exists = (path) => existsSync(new URL(path, import.meta.url));

test('login page renders the Firebase login flow instead of bypassing auth', () => {
  const source = read('./login/page.tsx');

  assert.doesNotMatch(source, /redirect\(['"]\/app['"]\)/);
  assert.match(source, /LoginForm/);
});

test('private app routes require a verified Firebase session', () => {
  assert.equal(exists('./app/layout.tsx'), true);

  const source = read('./app/layout.tsx');
  assert.match(source, /requireCurrentUser/);
});

test('session route exchanges Firebase ID tokens for http-only cookies', () => {
  assert.equal(exists('./api/session/route.ts'), true);

  const source = read('./api/session/route.ts');
  assert.match(source, /verifyFirebaseIdToken/);
  assert.match(source, /createSessionToken/);
  assert.doesNotMatch(source, /firebase-admin/);
  assert.doesNotMatch(source, /createSessionCookie/);
  assert.match(source, /httpOnly/);
});

test('private app sessions avoid Firebase Admin in Vercel serverless', () => {
  const source = read('../lib/auth/session.ts');
  const packageJson = read('../package.json');

  assert.match(source, /verifySessionToken/);
  assert.doesNotMatch(source, /getFirebaseAdminAuth/);
  assert.doesNotMatch(packageJson, /firebase-admin/);
});

test('middleware routes app subdomain traffic into the private app', () => {
  const source = read('../middleware.ts');

  assert.match(source, /app\.sentinelcloud\.dev/);
  assert.match(source, /\/app/);
  assert.match(source, /pathname\.startsWith\('\/api\/'\)/);
});

test('email verification links return users to the app login', () => {
  const source = read('../components/login-form.tsx');

  assert.match(source, /ActionCodeSettings/);
  assert.match(source, /app\.sentinelcloud\.dev/);
  assert.match(source, /sendEmailVerification\([^,]+,\s*emailVerificationActionSettings/);
});

test('private scan history proxy requires a Sentinel session and internal API key', () => {
  assert.equal(exists('./api/app/scans/recent/route.ts'), true);

  const source = read('./api/app/scans/recent/route.ts');

  assert.match(source, /requireCurrentUser/);
  assert.match(source, /SENTINEL_INTERNAL_API_KEY/);
  assert.match(source, /x-sentinel-internal-key/);
});

test('private domains proxy requires a Sentinel session and forwards user context', () => {
  assert.equal(exists('./api/app/domains/route.ts'), true);

  const source = read('./api/app/domains/route.ts');

  assert.match(source, /requireCurrentUser/);
  assert.match(source, /SENTINEL_INTERNAL_API_KEY/);
  assert.match(source, /x-sentinel-user-email/);
  assert.match(source, /\/internal\/domains/);
});

test('private projects proxy requires a Sentinel session and forwards user context', () => {
  assert.equal(exists('./api/app/projects/route.ts'), true);

  const source = read('./api/app/projects/route.ts');

  assert.match(source, /requireCurrentUser/);
  assert.match(source, /SENTINEL_INTERNAL_API_KEY/);
  assert.match(source, /x-sentinel-user-email/);
  assert.match(source, /\/internal\/projects/);
});

test('private scans view renders authenticated persisted scan history', () => {
  const shell = read('../components/professional-app-shell.tsx');

  assert.match(shell, /PrivateScanHistory/);
  assert.doesNotMatch(shell, /const scans = \[/);
});

test('private domains view renders authenticated persisted domains', () => {
  const shell = read('../components/professional-app-shell.tsx');

  assert.match(shell, /PrivateDomains/);
  assert.doesNotMatch(shell, /const domains = \[/);
});

test('private projects view renders authenticated persisted projects', () => {
  const shell = read('../components/professional-app-shell.tsx');

  assert.match(shell, /PrivateProjects/);
  assert.doesNotMatch(shell, /const projects = \[/);
});
