import { describe, it, expect } from 'vitest';
import {
  accessTokenResponseSchema,
  loginRequestSchema,
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

const validLogReq = {
  email: 'siuu@gmail.com',
  password: 'siuu123',
};

const validATResp = {
  accessToken: 'eyJafl',
  tokenType: 'Bearer',
  expiresIn: 900,
};

describe('loginRequestSchema', () => {
  it('accepts a valid login request', () => {
    expect(loginRequestSchema.parse(validLogReq)).toEqual(validLogReq);
  });

  it('rejects an invalid email', () => {
    const res = {
      ...validLogReq,
      email: 'not-an-email',
    };
    expect(loginRequestSchema.safeParse(res).success).toBe(false);
  });

  it('rejects an email with only spaces', () => {
    const res = {
      ...validLogReq,
      email: '        ',
    };
    expect(loginRequestSchema.safeParse(res).success).toBe(false);
  });

  it('rejects an empty password', () => {
    const res = {
      ...validLogReq,
      password: '',
    };
    expect(loginRequestSchema.safeParse(res).success).toBe(false);
  });

  it('accepts a short password so existing accounts can still sign in', () => {
    const res = {
      ...validLogReq,
      password: 'short',
    };
    expect(loginRequestSchema.safeParse(res).success).toBe(true);
  });

  it('rejects an extra field', () => {
    const res = {
      ...validLogReq,
      field: 'extra',
    };
    expect(loginRequestSchema.safeParse(res).success).toBe(false);
  });

  it('normalizes email to lowercase', () => {
    const res = {
      ...validLogReq,
      email: 'SIUU@GMAIL.COM',
    };
    expect(loginRequestSchema.parse(res).email).toEqual('siuu@gmail.com');
  });
});

describe('accessTokenResponseSchema', () => {
  it('accepts a valid access token resp', () => {
    expect(accessTokenResponseSchema.parse(validATResp)).toEqual(validATResp);
  });

  it('rejects tokenType value is not Bearer', () => {
    const res = {
      ...validATResp,
      tokenType: 'bearer', // not Bearer
    };
    expect(accessTokenResponseSchema.safeParse(res).success).toBe(false);
  });

  it('rejects expiresIn is not positive number', () => {
    const res = {
      ...validATResp,
      expiresIn: 0,
    };
    expect(accessTokenResponseSchema.safeParse(res).success).toBe(false);
  });

  it('rejects to have refreshToken field', () => {
    const res = {
      ...validATResp,
      refreshToken: 'asedrftyuljkjhg',
    };
    expect(accessTokenResponseSchema.safeParse(res).success).toBe(false);
  });
});
