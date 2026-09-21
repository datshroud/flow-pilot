import { describe, expect, it } from 'vitest';

describe('@flowpilot/contracts', () => {
  it('exports its public contracts', async () => {
    const contracts = await import('../src/index.js');

    expect(contracts.errorEnvelopeSchema).toBeDefined();
    expect(contracts.publicErrorSchema).toBeDefined();
    expect(contracts.healthRespSchema).toBeDefined();
    expect(contracts.healthStatusSchema).toBeDefined();
    expect(contracts.createEventEnvelopeSchema).toBeDefined();
    expect(contracts.eventEnvelopeSchema).toBeDefined();
    expect(contracts.registerRequestSchema).toBeDefined();
    expect(contracts.userResponseSchema).toBeDefined();
    expect(contracts.loginRequestSchema).toBeDefined();
    expect(contracts.accessTokenResponseSchema).toBeDefined();
    expect(contracts.ticketStatusSchema).toBeDefined();
    expect(contracts.ticketPrioritySchema).toBeDefined();
    expect(contracts.ticketCategorySchema).toBeDefined();
    expect(contracts.createTicketRequestSchema).toBeDefined();
    expect(contracts.ticketResponseSchema).toBeDefined();
    expect(contracts.predictionTaskSchema).toBeDefined();
    expect(contracts.confidenceSchema).toBeDefined();
    expect(contracts.duplicateCandidateSchema).toBeDefined();
    expect(contracts.predictionResultSchema).toBeDefined();
    expect(contracts.predictRequestSchema).toBeDefined();
    expect(contracts.predictionFailureReasonSchema).toBeDefined();
    expect(contracts.predictionFailureSchema).toBeDefined();
    expect(contracts.predictionSchema).toBeDefined();
    expect(contracts.predictResponseSchema).toBeDefined();
  });
});
