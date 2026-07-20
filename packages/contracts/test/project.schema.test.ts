import { describe, expect, it } from 'vitest';
import {
  createProjectRequestSchema,
  projectResponseSchema,
} from '../src/project.schema.js';

const validCreateProjectRequest = {
  name: 'cognitive-guard',
  repositoryUri: 'https://github.com/datshroud/cognitive-guard.git',
  language: 'typescript',
};

describe('createProjectRequestSchema', () => {
  it('accepts a minimal valid payload without repositoryUri', () => {
    const res = createProjectRequestSchema.safeParse({
      name: 'cognitive-guard',
      language: 'typescript',
    });
    expect(res.success).toBe(true);
  });
  it('accepts a full valid payload with repositoryUri', () => {
    const res = createProjectRequestSchema.safeParse({
      ...validCreateProjectRequest,
    });
    expect(res.success).toBe(true);
  });
  it('rejects an empty name', () => {
    const res = createProjectRequestSchema.safeParse({
      ...validCreateProjectRequest,
      name: '',
    });
    expect(res.success).toBe(false);
  });
  it('rejects a name that is only whitespace', () => {
    const res = createProjectRequestSchema.safeParse({
      ...validCreateProjectRequest,
      name: '',
    });
    expect(res.success).toBe(false);
  });
  it('rejects an invalid language', () => {
    const res = createProjectRequestSchema.safeParse({
      ...validCreateProjectRequest,
      language: 'C++',
    });
    expect(res.success).toBe(false);
  });
  it('rejects a repositoryUri that is not a valid URL', () => {
    const res = createProjectRequestSchema.safeParse({
      ...validCreateProjectRequest,
      repositoryUri: 'not-a-url',
    });
    expect(res.success).toBe(false);
  });
  it('rejects unknown fields', () => {
    const res = createProjectRequestSchema.safeParse({
      ...validCreateProjectRequest,
      extra: 'siuu',
    });
    expect(res.success).toBe(false);
  });
});

describe('projectResponseSchema', () => {
  it('accepts a complete valid resp', () => {
    const res = projectResponseSchema.safeParse({
      id: '3f1a1e2e-4b8a-4c1a-9c1a-8f0a1b2c3d4e',
      ...validCreateProjectRequest,
      createdAt: '2026-07-21T00:00:00.000Z',
    });
    expect(res.success).toBe(true);
  });
  it('rejects a resp with invalid id', () => {
    const res = projectResponseSchema.safeParse({
      id: 'not-a-uuid',
      ...validCreateProjectRequest,
      createdAt: '2026-07-21T00:00:00.000Z',
    });
    expect(res.success).toBe(false);
  });
  it('rejects a resp with a malformed createdAt', () => {
    const res = projectResponseSchema.safeParse({
      id: '3f1a1e2e-4b8a-4c1a-9c1a-8f0a1b2c3d4e',
      ...validCreateProjectRequest,
      createdAt: 'not-a-date',
    });
    expect(res.success).toBe(false);
  });
});
