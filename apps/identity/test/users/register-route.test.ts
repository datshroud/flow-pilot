import { describe, it } from 'vitest';
import { createApp } from '../../src/app.js';
import {
  EmailAlreadyRegisteredError,
  type UserRepository,
} from '../../src/users/domain/ports.js';
import { createFakeHasher, createFakeRepository } from '../helpers/fakes.js';
import request from 'supertest';
import { expect } from 'vitest';
import { errorEnvelopeSchema, userResponseSchema } from '@flowpilot/contracts';

const validBody = {
  email: 'ada@example.com',
  password: 'correct horse battery',
  displayName: 'Ada',
};

const appWith = (users: UserRepository) =>
  createApp({ users, hasher: createFakeHasher().hasher });

describe('POST /v1/auth/register', () => {
  it('creates a user and returns 201', async () => {
    const resp = await request(appWith(createFakeRepository().users))
      .post('/v1/auth/register')
      .send(validBody);

    expect(resp.status).toBe(201);
    const body: unknown = resp.body;
    expect(userResponseSchema.parse(body)).toEqual({
      id: 'usr_1',
      email: 'ada@example.com',
      displayName: 'Ada',
      status: 'ACTIVE',
      createdAt: '2026-07-27T10:00:00.000Z',
    });
  });

  it('never returns the password hash', async () => {
    const resp = await request(appWith(createFakeRepository().users))
      .post('/v1/auth/register')
      .send(validBody);

    expect(resp.status).toBe(201);
    const body: unknown = resp.body;
    expect(JSON.stringify(body)).not.toContain('argon2');
  });

  it('returns 400 for an invalid email', async () => {
    const resp = await request(appWith(createFakeRepository().users))
      .post('/v1/auth/register')
      .send({ ...validBody, email: 'not-an-email' });
    expect(resp.status).toBe(400);
    const body: unknown = resp.body;
    expect(errorEnvelopeSchema.parse(body).error.code).toBe(
      'VALIDATION_FAILED',
    );
  });

  it('returns 400 for an undeclared field', async () => {
    const resp = await request(appWith(createFakeRepository().users))
      .post('/v1/auth/register')
      .send({ ...validBody, field: 'extra' });
    expect(resp.status).toBe(400);
  });

  it('returns 409 when the email is already registered', async () => {
    const users: UserRepository = {
      create: () => Promise.reject(new EmailAlreadyRegisteredError()),
    };
    const resp = await request(appWith(users))
      .post('/v1/auth/register')
      .send(validBody);
    expect(resp.status).toBe(409);
    const body: unknown = resp.body;
    expect(errorEnvelopeSchema.parse(body).error.code).toBe(
      'EMAIL_ALREADY_REGISTERED',
    );
  });

  it('returns 500 without leaking internal details', async () => {
    const users: UserRepository = {
      create: () => Promise.reject(new Error('connection string leaked here')),
    };
    const resp = await request(appWith(users))
      .post('/v1/auth/register')
      .send(validBody);
    expect(resp.status).toBe(500);
    const body: unknown = resp.body;
    expect(JSON.stringify(body)).not.toContain('connection string');
  });

  it('echoes an incoming request id', async () => {
    const resp = await request(appWith(createFakeRepository().users))
      .post('/v1/auth/register')
      .set('x-request-id', 'req_test_1')
      .send(validBody);
    expect(resp.headers['x-request-id']).toBe('req_test_1');
  });

  it('returns 404 for an unknown route', async () => {
    const resp = await request(appWith(createFakeRepository().users)).get(
      '/v1/nope',
    );

    expect(resp.status).toBe(404);
  });
});
