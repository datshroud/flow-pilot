import { describe, it, expect } from 'vitest';
import {
  registerRequestSchema,
  userResponseSchema,
} from '../src/auth.schema.js';

const validRegReq = {
  email: 'siuu@gmail.com',
  password: 'siuu1234567890',
  displayName: 'siuu',
};

const validUserResp = {
  id: 'usr_1',
  email: 'ada@example.com',
  displayName: 'Ada',
  status: 'ACTIVE',
  createdAt: '2026-07-27T10:00:00.000Z',
};

describe('registerRequestSchema', () => {
  it('accepts valid register request', () => {
    expect(registerRequestSchema.safeParse(validRegReq).success).toBe(true);
  });
  it('rejects the invalid email register request', () => {
    const res = {
      ...validRegReq,
      email: 'not-an-email',
    };
    expect(registerRequestSchema.safeParse(res).success).toBe(false);
  });
  it('rejects the invalid password with less than 12', () => {
    const res = {
      ...validRegReq,
      password: 'less12',
    };
    expect(registerRequestSchema.safeParse(res).success).toBe(false);
  });
    it('rejects a password longer than 128 characters', () => {
    const res = {
      ...validRegReq,
      password: 'a'.repeat(129),
    };
    expect(registerRequestSchema.safeParse(res).success).toBe(false);
  });
  it('rejects the displayName with only spaces', () => {
    const res = {
      ...validRegReq,
      displayName: '     ',
    };
    expect(registerRequestSchema.safeParse(res).success).toBe(false);
  });
  it('rejects an extra field', () => {
    const res = {
      ...validRegReq,
      role: 'ADMIN',
    };
    expect(registerRequestSchema.safeParse(res).success).toBe(false);
  });
  it('normalizes email to lowercase', () => {
    const res = {
      ...validRegReq,
      email: 'ADA@Example.COM',
    };
    expect(registerRequestSchema.parse(res).email).toEqual('ada@example.com');
  });
});

describe('userResponseSchema', () => {
  it('accepts a valid resp', () => {
    expect(userResponseSchema.safeParse(validUserResp).success).toBe(true);
  });
  it('rejects resp have an extra fields', () => {
    const res = {
      ...validUserResp,
      passwordHash: '$argon2id$...',
    };
    expect(userResponseSchema.safeParse(res).success).toBe(false);
  });
  it('rejects an invalid status', () => {
    const res = {
      ...validUserResp,
      status: 'PENDING',
    };
    expect(userResponseSchema.safeParse(res).success).toBe(false);
  });
});
