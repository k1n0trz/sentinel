import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { URL } from 'node:url';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const exists = (path) => existsSync(new URL(path, import.meta.url));

test('browser API client uses same-origin public API routes', () => {
  const source = read('../lib/api.ts');

  assert.doesNotMatch(source, /localhost:4100/);
  assert.doesNotMatch(source, /NEXT_PUBLIC_API_URL/);
  assert.match(source, /\/api\/public/);
  assert.match(source, /\/scans/);
  assert.match(source, /\/reports/);
});

test('public scan proxy route exists for production diagnostics', () => {
  assert.equal(exists('./api/public/scans/route.ts'), true);

  const routeSource = read('./api/public/scans/route.ts');
  const proxySource = read('./api/public/_proxy.ts');

  assert.match(routeSource, /\/public\/scans/);
  assert.match(proxySource, /SENTINEL_API_URL/);
  assert.doesNotMatch(proxySource, /NEXT_PUBLIC_API_URL/);
});
