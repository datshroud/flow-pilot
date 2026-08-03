import type { TokenIssuer } from '../../src/auth/domain/ports.js';
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
