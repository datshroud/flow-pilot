import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

const validEnv = {
  IDENTITY_DATABASE_URL:
    'postgresql://identity:identity@localhost:5433/flowpilot_identity',
  IDENTITY_PORT: '4101',

  IDENTITY_JWT_PRIVATE_KEY: 'ZmFrZS1rZXk=',
};

describe('loadConfig', () => {
  it('parses a valid environment', () => {
    expect(loadConfig(validEnv)).toEqual({
      databaseUrl: validEnv.IDENTITY_DATABASE_URL,
      port: 4101,
      jwtPrivateKey: 'ZmFrZS1rZXk=',
      jwtIssuer: 'flowpilot-identity',
      jwtAudience: 'flowpilot',
      accessTokenTtlSeconds: 900,
    });
  });
  it('defaults the port when it is not set', () => {
    const res = loadConfig({
      IDENTITY_DATABASE_URL: validEnv.IDENTITY_DATABASE_URL,
      IDENTITY_JWT_PRIVATE_KEY: validEnv.IDENTITY_JWT_PRIVATE_KEY,
    });
    expect(res.port).toEqual(4101);
  });
  it('ignores unrelated environment variables', () => {
    const res = loadConfig({ ...validEnv, PATH: '/siuu' });
    expect(res.databaseUrl).toEqual(validEnv.IDENTITY_DATABASE_URL);
  });
  it('throws when the database url is missing', () => {
    expect(() => loadConfig({})).toThrow(/IDENTITY_DATABASE_URL/);
  });
  it('throws when the database url is not a url', () => {
    expect(() => loadConfig({ IDENTITY_DATABASE_URL: 'not-a-url' })).toThrow();
  });
  it('throws when the port is not a number', () => {
    expect(() => loadConfig({ ...validEnv, IDENTITY_PORT: 'siuu' })).toThrow();
  });
});
