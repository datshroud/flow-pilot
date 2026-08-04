import type {
  RefreshTokenCodec,
  RefreshTokenRepository,
  StoredRefreshToken,
  TokenIssuer,
} from '../../src/auth/domain/ports.js';
import type {
  NewUser,
  PasswordHasher,
  StoredUser,
  UserCredentials,
  UserRepository,
} from '../../src/users/domain/ports.js';
import { fakePublicJwk } from '../health.test.js';
import type { AppDeps } from '../../src/app.js';

export const createFakeHasher = (
  options: { verifyResult?: boolean } = {},
): {
  hasher: PasswordHasher;
  calls: string[];
  verifyCalls: string[][];
} => {
  const calls: string[] = [];
  const verifyCalls: string[][] = [];
  return {
    calls,
    verifyCalls,
    hasher: {
      hash: (plainPassword) => {
        calls.push(plainPassword);
        return Promise.resolve('$argon2id$v=19$fake');
      },
      verify: (passwordHash, plainPassword) => {
        verifyCalls.push([passwordHash, plainPassword]);
        return Promise.resolve(options.verifyResult ?? true);
      },
    },
  };
};

export const createFakeRepository = (
  seeded: UserCredentials[] = [],
): {
  users: UserRepository;
  saved: NewUser[];
} => {
  const saved: NewUser[] = [];
  return {
    saved,
    users: {
      create: (user) => {
        saved.push(user);
        return Promise.resolve({
          id: 'usr_1',
          email: user.email,
          displayName: user.displayName,
          status: 'ACTIVE',
          createdAt: new Date('2026-07-27T10:00:00.000Z'),
        } satisfies StoredUser);
      },
      findByEmail: (email) =>
        Promise.resolve(seeded.find((user) => user.email === email) ?? null),
    },
  };
};

export const createFakeTokenIssuer = (): {
  tokens: TokenIssuer;
  issuedFor: string[];
} => {
  const issuedFor: string[] = [];
  return {
    issuedFor,
    tokens: {
      issueAccessToken: (userId) => {
        issuedFor.push(userId);
        return Promise.resolve({
          accessToken: 'header.payload.signature',
          expiresIn: 900,
        });
      },
    },
  };
};

export const buildTestAppDeps = (
  overrides: Partial<AppDeps> = {},
): AppDeps => ({
  users: createFakeRepository().users,
  hasher: createFakeHasher().hasher,
  tokens: createFakeTokenIssuer().tokens,
  publicJwk: fakePublicJwk,
  ...overrides,
});

export const createFakeRefreshTokenRepository = (
  seeded: StoredRefreshToken[] = [],
): { refreshTokens: RefreshTokenRepository; rows: StoredRefreshToken[] } => {
  const rows: StoredRefreshToken[] = [...seeded];
  return {
    rows,
    refreshTokens: {
      create: (token) => {
        const stored: StoredRefreshToken = {
          id: `rt_${String(rows.length + 1)}`,
          ...token,
          usedAt: null,
          revokedAt: null,
        };
        rows.push(stored);
        return Promise.resolve(stored);
      },

      findByTokenHash: (tokenHash) =>
        Promise.resolve(
          rows.find((row) => row.tokenHash === tokenHash) ?? null,
        ),

      markUsed: (id, when) => {
        let idx = -1;
        for (let i = 0; i < rows.length; i++)
          if (rows[i]?.id === id && rows[i]?.usedAt === null) {
            idx = i;
            break;
          }
        const row = rows[idx];
        if (row !== undefined) rows[idx] = { ...row, usedAt: when };
        return Promise.resolve();
      },

      revokeFamily: (familyId, when) => {
        rows.forEach((row, i) => {
          if (row.familyId === familyId && row.revokedAt === null)
            rows[i] = { ...row, revokedAt: when };
        });
        return Promise.resolve();
      },
    },
  };
};

export const createFakeCodec = (): {
  codec: RefreshTokenCodec;
  generated: string[];
} => {
  const generated: string[] = [];
  let cnt = 0;
  return {
    generated,
    codec: {
      generate: () => {
        cnt++;
        const token = `raw-token-${String(cnt)}`;
        generated.push(token);
        return token;
      },
      hash: (token) => `hashed(${token})`,
    },
  };
};
