import { describe, expect, it } from 'vitest';
import type { UserCredentials } from '../../src/users/domain/ports.js';
import { createApp } from '../../src/app.js';
import { buildTestAppDeps, createFakeRepository } from '../helpers/fakes.js';
import request from 'supertest';
import {
  accessTokenResponseSchema,
  errorEnvelopeSchema,
} from '@flowpilot/contracts';

const uc: UserCredentials = {
  id: 'usr_uc',
  email: 'uc@gmail.com',
  passwordHash: '$argon2id$v=19$stored',
  status: 'ACTIVE',
};

const validBody = {
  email: 'uc@gmail.com',
  password: 'any password',
};

describe('POST /v1/auth/login', () => {
  it('returns an access token for valid credentials', async () => {
    const app = createApp(
      buildTestAppDeps({ users: createFakeRepository([uc]).users }),
    );
    const resp = await request(app).post('/v1/auth/login').send(validBody);
    expect(resp.status).toBe(200);
    const body: unknown = resp.body;
    expect(accessTokenResponseSchema.parse(body)).toEqual({
      accessToken: 'header.payload.signature',
      tokenType: 'Bearer',
      expiresIn: 900,
    });
  });

  it('returns 401 for an unknown email', async () => {
    const app = createApp(buildTestAppDeps());
    const resp = await request(app).post('/v1/auth/login').send(validBody);
    expect(resp.status).toBe(401);
    const body: unknown = resp.body;
    expect(errorEnvelopeSchema.parse(body).error.code).toBe(
      'INVALID_CREDENTIALS',
    );
  });

  it('does not reveal whether the email or the password was wrong', async () => {
    const app = createApp(buildTestAppDeps());
    const resp = await request(app).post('/v1/auth/login').send(validBody);
    const text = JSON.stringify(resp.body).toLowerCase();
    expect(text).not.toContain('not found');
    expect(text).not.toContain('unknown');
    expect(text).not.toContain('exist');
  });

  it('returns 400 for a malformed body', async () => {
    const app = createApp(buildTestAppDeps());
    const resp = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'not-an-email', password: '' });
    expect(resp.status).toBe(400);
  });
});
