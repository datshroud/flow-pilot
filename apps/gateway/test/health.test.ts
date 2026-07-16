import request from 'supertest';
import { healthRespSchema, type HealthResp } from '@cognitive-guard/contracts';
import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';

const parseHealthBody = (body: unknown): HealthResp =>
  healthRespSchema.parse(body);

describe('Gateway health routes', () => {
  it('returns a healthy liveness resp', async () => {
    const resp = await request(createApp()).get('/health/live');
    expect(resp.status).toBe(200);

    const body: unknown = resp.body;
    expect(parseHealthBody(body)).toEqual({ status: 'ok' });
  });

  it('returns ready by default', async () => {
    const resp = await request(createApp()).get('/health/ready');
    expect(resp.status).toBe(200);
    const body: unknown = resp.body;
    expect(parseHealthBody(body)).toEqual({ status: 'ok' });
  });

  it('returns degraded when readiness is false', async () => {
    const resp = await request(createApp({ isReady: () => false })).get(
      '/health/ready',
    );
    expect(resp.status).toBe(503);
    const body: unknown = resp.body;
    expect(parseHealthBody(body)).toEqual({ status: 'degraded' });
  });

  it('returns degraded when readiness check throws', async () => {
    const resp = await request(
      createApp({
        isReady: () => {
          throw new Error('dependency unavailable');
        },
      }),
    ).get('/health/ready');
    expect(resp.status).toBe(503);
    const body: unknown = resp.body;
    expect(parseHealthBody(body)).toEqual({ status: 'degraded' });
  });
});
