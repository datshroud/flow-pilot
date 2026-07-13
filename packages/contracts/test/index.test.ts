import { describe, expect, it } from 'vitest';

describe('@cognitive-guard/contracts', () => {
  it('exports its public health contracts', async () => {
    const contracts = await import('../src/index.js');

    expect(contracts.healthRespSchema).toBeDefined();
    expect(contracts.healthStatusSchema).toBeDefined();
  });
});
