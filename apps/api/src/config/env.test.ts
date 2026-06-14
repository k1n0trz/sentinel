import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseEnv } from './env.js';

describe('parseEnv', () => {
  it('uses the platform PORT as the API port when API_PORT is not set', () => {
    const env = parseEnv({
      NODE_ENV: 'production',
      PORT: '8080',
    });

    assert.equal(env.API_PORT, 8080);
  });

  it('lets API_PORT override the platform PORT', () => {
    const env = parseEnv({
      API_PORT: '4100',
      NODE_ENV: 'production',
      PORT: '8080',
    });

    assert.equal(env.API_PORT, 4100);
  });
});
