import { beforeAll, describe, expect, it } from 'vitest';
import {
  JWT_ALGORITHM,
  loadSigningKey,
  type SigningKey,
} from '../../src/auth/infrastructure/signing-key.js';
import { exportPKCS8, generateKeyPair, jwtVerify, SignJWT } from 'jose';

let base64Pkcs8: string;
let signingKey: SigningKey;

beforeAll(async () => {
  const { privateKey } = await generateKeyPair(JWT_ALGORITHM, {
    extractable: true,
  });
  base64Pkcs8 = Buffer.from(await exportPKCS8(privateKey)).toString('base64');
  signingKey = await loadSigningKey(base64Pkcs8);
});

describe('loadSigningKey', () => {
  it('never exposes the private component in the public JWK', () => {
    expect(signingKey.publicJwk).not.toHaveProperty('d');
    expect(JSON.stringify(signingKey.publicJwk)).not.toContain('"d"');
  });

  it('publishes an EC P-256 signing key', () => {
    expect(signingKey.publicJwk.kty).toBe('EC');
    expect(signingKey.publicJwk.crv).toBe('P-256');
    expect(signingKey.publicJwk.alg).toBe(JWT_ALGORITHM);
    expect(signingKey.publicJwk.use).toBe('sig');
  });

  it('derives a stable kid from the same key material', async () => {
    const again = await loadSigningKey(base64Pkcs8);
    expect(again.kid).toBe(signingKey.kid);
    expect(signingKey.publicJwk.kid).toBe(signingKey.kid);
  });

  it('derives a different kid for a different key', async () => {
    const { privateKey } = await generateKeyPair(JWT_ALGORITHM, {
      extractable: true,
    });
    const other = await loadSigningKey(
      Buffer.from(await exportPKCS8(privateKey)).toString('base64'),
    );
    expect(other.kid).not.toBe(signingKey.kid);
  });

  it('signs a token that verifies against the published public key', async () => {
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: JWT_ALGORITHM, kid: signingKey.kid })
      .setSubject('usr_1')
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(signingKey.privateKey);

    const { payload } = await jwtVerify(token, signingKey.publicJwk);
    expect(payload.sub).toBe('usr_1');
  });

  it('rejects key material that is not a valid PKCS8 key', async () => {
    await expect(loadSigningKey('bm90LWEta2V5')).rejects.toThrow();
  });
});
