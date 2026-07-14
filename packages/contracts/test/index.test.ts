import { describe, expect, it } from 'vitest';

describe('@cognitive-guard/contracts', () => {
  it('exports its public contracts', async () => {
    const contracts = await import('../src/index.js');

    expect(contracts.errorEnvelopeSchema).toBeDefined();
    expect(contracts.publicErrorSchema).toBeDefined();
    expect(contracts.healthRespSchema).toBeDefined();
    expect(contracts.healthStatusSchema).toBeDefined();
  });
});
