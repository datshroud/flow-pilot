import { describe, expect, it } from 'vitest';
import { argon2PasswordHasher } from '../../src/users/infrastructure/argon2-password-hasher.js';
import { verify } from '@node-rs/argon2';

describe('argon2PasswordHasher', () => {
  it('produces an argon2id hash with the configured parameters', async () => {
    const hashed = await argon2PasswordHasher.hash('correct horse battery');
    expect(hashed.startsWith('$argon2id$')).toBe(true);
    expect(hashed).toContain('m=19456,t=2,p=1');
  });
  it('verifies the correct password and rejects a wrong one', async () => {
    const hashed = await argon2PasswordHasher.hash('correct horse battery');
    expect(await verify(hashed, 'correct horse battery')).toBe(true);
    expect(await verify(hashed, 'wrong password')).toBe(false);
  });
  it('produces a different hash for the same password', async () => {
    const hashed1 = await argon2PasswordHasher.hash('correct horse battery');
    const hashed2 = await argon2PasswordHasher.hash('correct horse battery');
    expect(hashed1).not.toBe(hashed2);
  });
});
