import { beforeAll, describe, expect, it } from 'vitest';
import {
  JWT_ALGORITHM,
  loadSigningKey,
  type SigningKey,
} from '../../src/auth/infrastructure/signing-key.js';
import { exportPKCS8, generateKeyPair } from 'jose';
import { buildTestAppDeps } from '../helpers/fakes.js';
import { createApp } from '../../src/app.js';
import request from 'supertest';

let signingKey: SigningKey;

beforeAll(async () => {
  const { privateKey } = await generateKeyPair(JWT_ALGORITHM, {
    extractable: true,
  });
  signingKey = await loadSigningKey(
    Buffer.from(await exportPKCS8(privateKey)).toString('base64'),
  );
});

const createTestApp = () =>
  createApp(buildTestAppDeps({ publicJwk: signingKey.publicJwk }));

describe('GET /.well-known/jwks.json', () => {
  it('publishes the public key in JWKS format', async () => {
    const resp = await request(createTestApp()).get('/.well-known/jwks.json');
    expect(resp.status).toBe(200);
    const body = resp.body as { keys: unknown[] };
    expect(body.keys).toHaveLength(1);
    expect(body.keys[0]).toMatchObject({
      kty: 'EC',
      crv: 'P-256',
      alg: JWT_ALGORITHM,
      use: 'sig',
      kid: signingKey.kid,
    });
  });

  it('never publishes the private component', async () => {
    const resp = await request(createTestApp()).get('/.well-known/jwks.json');
    expect(JSON.stringify(resp.body)).not.toContain('"d"');
  });

  it('marks the resp as cacheable', async () => {
    const resp = await request(createTestApp()).get('/.well-known/jwks.json');
    expect(resp.headers['cache-control']).toContain('max-age=');
  });
});
