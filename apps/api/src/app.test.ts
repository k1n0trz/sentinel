import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AppError } from './common/errors.js';
import { buildApp } from './app.js';

describe('buildApp error handling', () => {
  it('serializes AppError responses consistently', async () => {
    const app = await buildApp();
    app.get('/test/app-error', async () => {
      throw new AppError('Persistence unavailable', 503);
    });

    const response = await app.inject('/test/app-error');
    await app.close();

    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.json(), {
      error: 'Persistence unavailable',
    });
  });
});
