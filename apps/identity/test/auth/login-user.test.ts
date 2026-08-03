import { describe, expect, it } from 'vitest';
import {
  InvalidCredentialsError,
  type UserCredentials,
} from '../../src/users/domain/ports.js';
import {
  createFakeHasher,
  createFakeRepository,
  createFakeTokenIssuer,
} from '../helpers/fakes.js';
import { loginUser } from '../../src/auth/application/login-user.js';

const uc: UserCredentials = {
  id: 'usr_uc',
  email: 'uc@gmail.com',
  passwordHash: '$argon2id$v=19$stored',
  status: 'ACTIVE',
};

const inp = {
  email: 'uc@gmail.com',
  password: 'correct horse battery',
};

describe('loginUser', () => {
  it('returns an access token for valid credentials', async () => {
    const { tokens, issuedFor } = createFakeTokenIssuer();
    const deps = {
      users: createFakeRepository([uc]).users,
      hasher: createFakeHasher().hasher,
      tokens,
    };
    const issued = await loginUser(deps, inp);
    expect(issued.accessToken).toBe('header.payload.signature');
    expect(issuedFor).toEqual(['usr_uc']);
  });

  it('verifies the password against the stored hash', async () => {
    const { hasher, verifyCalls } = createFakeHasher();
    const deps = {
      users: createFakeRepository([uc]).users,
      hasher,
      tokens: createFakeTokenIssuer().tokens,
    };
    await loginUser(deps, inp);
    expect(verifyCalls).toEqual([
      ['$argon2id$v=19$stored', 'correct horse battery'],
    ]);
  });

  it('rejects an unknown email', async () => {
    const deps = {
      users: createFakeRepository().users,
      hasher: createFakeHasher().hasher,
      tokens: createFakeTokenIssuer().tokens,
    };
    await expect(loginUser(deps, inp)).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });

  it('burns hashing work for an unknown email to equalize timing', async () => {
    const { hasher, calls } = createFakeHasher();
    const deps = {
      users: createFakeRepository().users,
      hasher,
      tokens: createFakeTokenIssuer().tokens,
    };
    await loginUser(deps, inp).catch(() => undefined);
    expect(calls).toEqual(['correct horse battery']);
  });

  it('rejects a disabled user even with the right password', async () => {
    const disUC: UserCredentials = { ...uc, status: 'DISABLED' };
    const deps = {
      users: createFakeRepository([disUC]).users,
      hasher: createFakeHasher().hasher,
      tokens: createFakeTokenIssuer().tokens,
    };
    await expect(loginUser(deps, inp)).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });

  it('rejects a wrong password', async () => {
    const deps = {
      users: createFakeRepository().users,
      hasher: createFakeHasher({ verifyResult: false }).hasher,
      tokens: createFakeTokenIssuer().tokens,
    };
    await expect(loginUser(deps, inp)).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });

  it('never issues a token when credentials are invalid', async () => {
    const { tokens, issuedFor } = createFakeTokenIssuer();
    const deps = {
      users: createFakeRepository().users,
      hasher: createFakeHasher().hasher,
      tokens,
    };
    await loginUser(deps, inp).catch(() => undefined);
    expect(issuedFor).toEqual([]);
  });
});
