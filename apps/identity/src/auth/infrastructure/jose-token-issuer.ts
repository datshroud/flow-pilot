import { SignJWT } from 'jose';
import type { IssuedToken, TokenIssuer } from '../domain/ports.js';
import { JWT_ALGORITHM, type SigningKey } from './signing-key.js';

export interface TokenIssuerOptions {
  readonly issuer: string;
  readonly audience: string;
  readonly ttlSeconds: number;
}

export const createJoseTokenIssuer = (
  key: SigningKey,
  options: TokenIssuerOptions,
): TokenIssuer => ({
  issueAccessToken: async (userId: string): Promise<IssuedToken> => {
    const issuedAt = Math.floor(Date.now() / 1000);

    const accessToken = await new SignJWT({})
      .setProtectedHeader({ alg: JWT_ALGORITHM, kid: key.kid, typ: 'JWT' })
      .setIssuer(options.issuer)
      .setAudience(options.audience)
      .setSubject(userId)
      .setIssuedAt(issuedAt)
      .setExpirationTime(issuedAt + options.ttlSeconds)
      .sign(key.privateKey);

    return { accessToken, expiresIn: options.ttlSeconds };
  },
});
