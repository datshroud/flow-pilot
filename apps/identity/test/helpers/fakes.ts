import type {
  NewUser,
  PasswordHasher,
  StoredUser,
  UserRepository,
} from '../../src/users/domain/ports.js';

export const createFakeHasher = (): {
  hasher: PasswordHasher;
  calls: string[];
} => {
  const calls: string[] = [];
  return {
    calls,
    hasher: {
      hash: (plainPassword) => {
        calls.push(plainPassword);
        return Promise.resolve('$argon2id$v=19$fake');
      },
    },
  };
};

export const createFakeRepository = (): {
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
    },
  };
};
