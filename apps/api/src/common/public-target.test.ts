import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AppError } from './errors.js';
import { assertPublicScanTarget } from './public-target.js';

const lookup = async (addresses: string[]) =>
  addresses.map((address) => ({
    address,
    family: address.includes(':') ? 6 : 4,
  }));

describe('assertPublicScanTarget', () => {
  it('rejects localhost hostnames', async () => {
    await assert.rejects(
      () =>
        assertPublicScanTarget(new URL('https://localhost'), async () =>
          lookup(['127.0.0.1']),
        ),
      (error) =>
        error instanceof AppError &&
        error.message.includes('publicly routable'),
    );
  });

  it('rejects direct private and metadata IPv4 targets', async () => {
    for (const target of [
      'http://127.0.0.1',
      'http://10.0.0.7',
      'http://192.168.1.10',
      'http://169.254.169.254',
    ]) {
      await assert.rejects(
        () => assertPublicScanTarget(new URL(target)),
        (error) =>
          error instanceof AppError &&
          error.message.includes('publicly routable'),
      );
    }
  });

  it('rejects hostnames that resolve to private networks', async () => {
    await assert.rejects(
      () =>
        assertPublicScanTarget(
          new URL('https://internal.example.com'),
          async () => lookup(['172.16.2.4']),
        ),
      (error) =>
        error instanceof AppError &&
        error.message.includes('publicly routable'),
    );
  });

  it('rejects non-standard public demo ports', async () => {
    await assert.rejects(
      () =>
        assertPublicScanTarget(new URL('https://example.com:8443'), async () =>
          lookup(['93.184.216.34']),
        ),
      (error) =>
        error instanceof AppError &&
        error.message.includes('standard HTTP/HTTPS ports'),
    );
  });

  it('allows standard HTTP and HTTPS targets with public DNS answers', async () => {
    await assert.doesNotReject(() =>
      assertPublicScanTarget(new URL('https://example.com'), async () =>
        lookup(['93.184.216.34']),
      ),
    );
    await assert.doesNotReject(() =>
      assertPublicScanTarget(new URL('http://example.com'), async () =>
        lookup(['93.184.216.34']),
      ),
    );
  });
});
