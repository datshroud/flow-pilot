import { describe, expect, it } from 'vitest';

describe('@cognitive-guard/contracts', () => {
  it('loads its public entry point', async () => {
    await expect(import('../src/index.js')).resolves.toBeDefined();
  });
});
