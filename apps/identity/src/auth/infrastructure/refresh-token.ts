import { createHash, randomBytes } from 'node:crypto';
import type { RefreshTokenCodec } from '../domain/ports.js';

export const generateRefreshToken = (): string =>
  randomBytes(32).toString('base64url');

export const hashRefreshToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export const cryptoRefreshTokenCodec: RefreshTokenCodec = {
  generate: generateRefreshToken,
  hash: hashRefreshToken,
};
