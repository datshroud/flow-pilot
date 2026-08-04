import { describe, it, expect } from 'vitest';
import { rotateRefreshToken } from '../../src/auth/application/rotate-refresh-token.js';
import {
  InvalidRefreshTokenError,
  RefreshTokenReuseError,
  type StoredRefreshToken,
} from '../../src/auth/domain/ports.js';
import {
  createFakeCodec,
  createFakeRefreshTokenRepository,
  createFakeTokenIssuer,
} from '../helpers/fakes.js';

const NOW = new Date('2026-08-01T12:00:00.000Z');
const TTL_SECONDS = 2_592_000;

const storedToken = (
  overrides: Partial<StoredRefreshToken> = {},
): StoredRefreshToken => ({
  id: 'rt_seed',
  userId: 'usr_ada',
  familyId: 'fam_1',
  tokenHash: 'hashed(presented)',
  expiresAt: new Date('2026-09-01T12:00:00.000Z'),
  usedAt: null,
  revokedAt: null,
  ...overrides,
});

const buildDeps = (seeded: StoredRefreshToken[]) => {
  const repository = createFakeRefreshTokenRepository(seeded);
  const issuer = createFakeTokenIssuer();
  const codecFake = createFakeCodec();

  return {
    repository,
    issuer,
    codecFake,
    deps: {
      refreshTokens: repository.refreshTokens,
      tokens: issuer.tokens,
      codec: codecFake.codec,
      now: () => NOW,
      ttlSeconds: TTL_SECONDS,
    },
  };
};

describe('rotateRefreshToken', () => {
  it('issues a new access and refresh token pair', async () => {
    const { deps, issuer } = buildDeps([storedToken()]);

    const session = await rotateRefreshToken(deps, 'presented');

    expect(session.accessToken).toBe('header.payload.signature');
    expect(session.refreshToken).toBe('raw-token-1');
    expect(issuer.issuedFor).toEqual(['usr_ada']);
  });

  it('marks the presented token as used', async () => {
    const { deps, repository } = buildDeps([storedToken()]);

    await rotateRefreshToken(deps, 'presented');

    expect(repository.rows[0]?.usedAt).toEqual(NOW);
  });

  it('keeps the replacement token in the same family', async () => {
    const { deps, repository } = buildDeps([storedToken()]);

    await rotateRefreshToken(deps, 'presented');

    const replacement = repository.rows[1];
    expect(replacement?.familyId).toBe('fam_1');
    expect(replacement?.tokenHash).toBe('hashed(raw-token-1)');
    expect(replacement?.expiresAt).toEqual(
      new Date(NOW.getTime() + TTL_SECONDS * 1000),
    );
  });

  it('never stores the raw replacement token', async () => {
    const { deps, repository } = buildDeps([storedToken()]);

    const session = await rotateRefreshToken(deps, 'presented');

    expect(JSON.stringify(repository.rows)).not.toContain(
      `"${session.refreshToken}"`,
    );
  });

  it('rejects an unknown token', async () => {
    const { deps } = buildDeps([]);

    await expect(rotateRefreshToken(deps, 'presented')).rejects.toBeInstanceOf(
      InvalidRefreshTokenError,
    );
  });

  it('rejects an expired token', async () => {
    const { deps } = buildDeps([
      storedToken({ expiresAt: new Date('2026-07-01T12:00:00.000Z') }),
    ]);

    await expect(rotateRefreshToken(deps, 'presented')).rejects.toBeInstanceOf(
      InvalidRefreshTokenError,
    );
  });

  it('rejects a token whose family was already revoked', async () => {
    const { deps } = buildDeps([storedToken({ revokedAt: NOW })]);

    await expect(rotateRefreshToken(deps, 'presented')).rejects.toBeInstanceOf(
      InvalidRefreshTokenError,
    );
  });

  it('revokes the whole family when an already used token is presented', async () => {
    const sibling = storedToken({
      id: 'rt_sibling',
      tokenHash: 'hashed(sibling)',
    });
    const { deps, repository } = buildDeps([
      storedToken({ usedAt: new Date('2026-08-01T11:00:00.000Z') }),
      sibling,
    ]);

    await expect(rotateRefreshToken(deps, 'presented')).rejects.toBeInstanceOf(
      RefreshTokenReuseError,
    );

    expect(repository.rows.every((row) => row.revokedAt !== null)).toBe(true);
  });

  it('does not revoke tokens belonging to another family', async () => {
    const otherFamily = storedToken({
      id: 'rt_other',
      familyId: 'fam_2',
      tokenHash: 'hashed(other)',
    });
    const { deps, repository } = buildDeps([
      storedToken({ usedAt: new Date('2026-08-01T11:00:00.000Z') }),
      otherFamily,
    ]);

    await rotateRefreshToken(deps, 'presented').catch(() => undefined);

    expect(
      repository.rows.find((row) => row.id === 'rt_other')?.revokedAt,
    ).toBeNull();
  });

  it('issues nothing when reuse is detected', async () => {
    const { deps, issuer, repository } = buildDeps([
      storedToken({ usedAt: new Date('2026-08-01T11:00:00.000Z') }),
    ]);

    await rotateRefreshToken(deps, 'presented').catch(() => undefined);

    expect(issuer.issuedFor).toEqual([]);
    expect(repository.rows).toHaveLength(1);
  });
});
