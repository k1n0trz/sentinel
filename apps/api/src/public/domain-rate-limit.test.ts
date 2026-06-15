import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createDomainRateLimiter } from './domain-rate-limit.js';

describe('createDomainRateLimiter', () => {
  it('allows requests up to the configured domain limit', () => {
    const limiter = createDomainRateLimiter({
      max: 2,
      now: () => 1000,
      windowMs: 60_000,
    });

    assert.deepEqual(limiter.consume(new URL('https://Example.com/path')), {
      allowed: true,
    });
    assert.deepEqual(limiter.consume(new URL('http://example.com/other')), {
      allowed: true,
    });
  });

  it('blocks repeated requests for the same hostname inside the window', () => {
    const limiter = createDomainRateLimiter({
      max: 1,
      now: () => 10_000,
      windowMs: 60_000,
    });

    assert.deepEqual(limiter.consume(new URL('https://example.com')), {
      allowed: true,
    });
    assert.deepEqual(limiter.consume(new URL('https://example.com/report')), {
      allowed: false,
      retryAfterMs: 60_000,
    });
  });

  it('resets the domain counter after the window expires', () => {
    let now = 10_000;
    const limiter = createDomainRateLimiter({
      max: 1,
      now: () => now,
      windowMs: 60_000,
    });

    assert.deepEqual(limiter.consume(new URL('https://example.com')), {
      allowed: true,
    });
    now = 70_001;
    assert.deepEqual(limiter.consume(new URL('https://example.com')), {
      allowed: true,
    });
  });
});
