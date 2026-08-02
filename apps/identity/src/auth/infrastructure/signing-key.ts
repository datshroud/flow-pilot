import {
  calculateJwkThumbprint,
  exportJWK,
  importPKCS8,
  type CryptoKey,
  type JWK,
} from 'jose';

export const JWT_ALGORITHM = 'ES256';

export interface SigningKey {
  readonly privateKey: CryptoKey;
  readonly kid: string;
  readonly publicJwk: JWK;
}

export const loadSigningKey = async (
  base64Pkcs8: string,
): Promise<SigningKey> => {
  const pkcs8 = Buffer.from(base64Pkcs8, 'base64').toString('utf8');
  const privateKey = await importPKCS8(pkcs8, JWT_ALGORITHM, {
    extractable: true,
  });

  const jwk = await exportJWK(privateKey);
  const { d: _d, ...publicJwk } = jwk;
  const kid = await calculateJwkThumbprint(publicJwk);
  return {
    privateKey,
    kid,
    publicJwk: { ...publicJwk, kid, alg: JWT_ALGORITHM, use: 'sig' },
  };
};
