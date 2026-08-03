import { describe, expect, it } from 'vitest';
import {
  generateRefreshToken,
  hashRefreshToken,
} from '../../src/auth/infrastructure/refresh-token.js';

describe('generateRefreshToken', () => {
  it('produces a url-safe token of sufficient length', () => {
    const token = generateRefreshToken();
    expect(token.length).toBeGreaterThanOrEqual(43);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('never produces the same token twice', () => {
    const tokens = new Set(
      Array.from({ length: 100 }, () => generateRefreshToken()),
    );
    expect(tokens.size).toBe(100);
  });
});

describe('hashRefreshToken', () => {
  it('is deterministic for the same token', () => {
    const token = generateRefreshToken();
    expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));
  });

  it('differs for different tokens', () => {
    expect(hashRefreshToken('token-a')).not.toBe(hashRefreshToken('token-b'));
  });

  it('never contains the raw token', () => {
    const token = generateRefreshToken();
    expect(hashRefreshToken(token)).not.toContain(token);
  });
});
