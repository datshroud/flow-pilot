import {
  EmailAlreadyRegisteredError,
  type NewUser,
  type PasswordHasher,
  type StoredUser,
  type UserRepository,
} from '../../src/users/domain/ports.js';
import { describe, it, expect } from 'vitest';
import { registerUser } from '../../src/users/application/register-user.js';

const createFakeHasher = () => {
  const calls: string[] = [];
  const hasher: PasswordHasher = {
    hash: (plainPassword) => {
      calls.push(plainPassword);
      return Promise.resolve('$argon2id$v=19$fake');
    },
  };
  return { hasher, calls };
};

const createFakeRepository = () => {
  const saved: NewUser[] = [];
  const users: UserRepository = {
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
  };
  return { users, saved };
};

const input = {
  email: 'test@gmail.com',
  password: 'correct horse battery',
  displayName: 'test',
};

describe('registerUser', () => {
  it('returns the stored user', async () => {
    const { hasher } = createFakeHasher();
    const { users } = createFakeRepository();
    const res = await registerUser({ users, hasher }, input);

    expect(res.email).toBe('test@gmail.com');
    expect(res.status).toBe('ACTIVE');
  });

  it('hashes the password before storing it', async () => {
    const { hasher, calls } = createFakeHasher();
    const { users, saved } = createFakeRepository();
    await registerUser({ users, hasher }, input);

    expect(calls).toEqual([input.password]);
    expect(saved[0]?.passwordHash).toBe('$argon2id$v=19$fake');
  });

  it('never stores the plaintext password', async () => {
    const { hasher } = createFakeHasher();
    const { users, saved } = createFakeRepository();
    await registerUser({ users, hasher }, input);
    expect(JSON.stringify(saved)).not.toContain(input.password);
  });

  it('propagates EmailAlreadyRegisteredError from the repository', async () => {
    const { hasher } = createFakeHasher();
    const users: UserRepository = {
      create: () => Promise.reject(new EmailAlreadyRegisteredError()),
    };
    await expect(registerUser({ users, hasher }, input)).rejects.toBeInstanceOf(
      EmailAlreadyRegisteredError,
    );
  });
});
