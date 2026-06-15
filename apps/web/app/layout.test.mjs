import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { URL } from 'node:url';

const layoutSource = readFileSync(new URL('./layout.tsx', import.meta.url), 'utf8');

test('root layout includes Google Analytics tag', () => {
  assert.match(layoutSource, /G-T6MP6KLJ21/);
  assert.match(layoutSource, /googletagmanager\.com\/gtag\/js/);
});
