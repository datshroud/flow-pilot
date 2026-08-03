import { hash, verify } from '@node-rs/argon2';
import type { PasswordHasher } from '../domain/ports.js';

const hashOptions = {
  memoryCost: 19456, // 19 MB
  timeCost: 2,
  parallelism: 1,
} as const;

export const argon2PasswordHasher: PasswordHasher = {
  hash: (plainPassword: string): Promise<string> =>
    hash(plainPassword, hashOptions),

  verify: (passwordHash: string, plainPassword: string): Promise<boolean> =>
    verify(passwordHash, plainPassword),
};
