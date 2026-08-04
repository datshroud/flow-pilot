import {
  InvalidRefreshTokenError,
  RefreshTokenReuseError,
  type RefreshTokenCodec,
  type RefreshTokenRepository,
  type TokenIssuer,
} from '../domain/ports.js';

export interface RotateRefreshTokenDeps {
  readonly refreshTokens: RefreshTokenRepository;
  readonly tokens: TokenIssuer;
  readonly codec: RefreshTokenCodec;
  readonly now: () => Date;
  readonly ttlSeconds: number;
}

export interface RotatedSession {
  readonly accessToken: string;
  readonly expiresIn: number;
  readonly refreshToken: string;
}

export const rotateRefreshToken = async (
  { refreshTokens, tokens, codec, now, ttlSeconds }: RotateRefreshTokenDeps,
  presentedToken: string,
): Promise<RotatedSession> => {
  const at = now();
  const stored = await refreshTokens.findByTokenHash(
    codec.hash(presentedToken),
  );
  if (stored === null) throw new InvalidRefreshTokenError();
  if (stored.revokedAt !== null) throw new InvalidRefreshTokenError();
  if (stored.usedAt !== null) {
    await refreshTokens.revokeFamily(stored.familyId, at);
    throw new RefreshTokenReuseError();
  }
  if (stored.expiresAt.getTime() <= at.getTime())
    throw new InvalidRefreshTokenError();
  await refreshTokens.markUsed(stored.id, at);

  const nxtToken = codec.generate();
  await refreshTokens.create({
    userId: stored.userId,
    familyId: stored.familyId,
    tokenHash: codec.hash(nxtToken),
    expiresAt: new Date(at.getTime() + ttlSeconds * 1000),
  });

  const issued = await tokens.issueAccessToken(stored.userId);
  return {
    accessToken: issued.accessToken,
    expiresIn: issued.expiresIn,
    refreshToken: nxtToken,
  };
};
