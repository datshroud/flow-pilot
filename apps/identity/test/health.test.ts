import request from 'supertest';
import { healthRespSchema, type HealthResp } from '@flowpilot/contracts';
import { describe, it, expect } from 'vitest';
import { createApp, type ReadinessCheck } from '../src/app.js';
import { createFakeHasher, createFakeRepository } from './helpers/fakes.js';
import type { JWK } from 'jose';

export const fakePublicJwk: JWK = {
  kty: 'EC',
  crv: 'P-256',
  x: 'test-x',
  y: 'test-y',
  kid: 'test-kid',
  alg: 'ES256',
  use: 'sig',
};

const createTestApp = (isReady?: ReadinessCheck) =>
  createApp({
    users: createFakeRepository().users,
    hasher: createFakeHasher().hasher,
    publicJwk: fakePublicJwk,
    ...(isReady === undefined ? {} : { isReady }),
  });

const parseHealthBody = (body: unknown): HealthResp =>
  healthRespSchema.parse(body);

describe('Workspace service health routes', () => {
  it('returns a healthy liveness resp', async () => {
    const resp = await request(createTestApp()).get('/health/live');
    expect(resp.status).toBe(200);

    const body: unknown = resp.body;
    expect(parseHealthBody(body)).toEqual({ status: 'ok' });
  });

  it('returns ready by default', async () => {
    const resp = await request(createTestApp()).get('/health/ready');
    expect(resp.status).toBe(200);
    const body: unknown = resp.body;
    expect(parseHealthBody(body)).toEqual({ status: 'ok' });
  });

  it('returns degraded when readiness is false', async () => {
    const resp = await request(createTestApp(() => false)).get('/health/ready');
    expect(resp.status).toBe(503);
    const body: unknown = resp.body;
    expect(parseHealthBody(body)).toEqual({ status: 'degraded' });
  });

  it('returns degraded when readiness check throws', async () => {
    const resp = await request(
      createTestApp(() => {
        throw new Error('dependency unavailable');
      }),
    ).get('/health/ready');
    expect(resp.status).toBe(503);
    const body: unknown = resp.body;
    expect(parseHealthBody(body)).toEqual({ status: 'degraded' });
  });
});
