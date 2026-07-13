import { describe, expect, it } from 'vitest';

import { healthRespSchema } from '../src/health.schema.js';

describe('healthRespSchema', () => {
  it.each(['ok', 'degraded'] as const)('accepts status "%s"', (status) => {
    expect(healthRespSchema.parse({ status })).toEqual({ status });
  });

  it('rejects a missing status', () => {
    expect(healthRespSchema.safeParse({}).success).toBe(false);
  });

  it('rejects an unsupported status', () => {
    expect(healthRespSchema.safeParse({ status: 'unknown' }).success).toBe(
      false,
    );
  });

  it('rejects fields outside the contract', () => {
    expect(
      healthRespSchema.safeParse({
        status: 'ok',
        debug: true,
      }).success,
    ).toBe(false);
  });
});
