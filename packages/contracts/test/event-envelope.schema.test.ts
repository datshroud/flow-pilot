import { describe, it, expect } from 'vitest';
import {
  createEventEnvelopeSchema,
  eventEnvelopeSchema,
} from '../src/event-envelope.schema.js';
import { z } from 'zod';

const validEventEnvelope = {
  eventId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  eventType: 'case.created',
  eventVersion: 1,
  occurredAt: '2026-07-25T01:30:00.000Z',
  producer: 'platform-service',
  tenantId: 'ten_01',
  actor: { type: 'USER', id: 'usr_01' },
  correlationId: 'req_01',
  causationId: 'cmd_01',
  aggregate: {
    type: 'Case',
    id: 'case_01',
    version: 1,
  },
  data: { status: 'OPEN' },
  metadata: { traceparent: '00-abc-def-01' },
};

const minimalEventEnvelope = {
  eventId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  eventType: 'workflow.instance.started',
  eventVersion: 1,
  occurredAt: '2026-07-25T01:30:00.000Z',
  producer: 'workflow-service',
  tenantId: 'ten_01',
  actor: { type: 'SYSTEM', id: 'workflow-service' },
  correlationId: 'req_01',
  aggregate: { type: 'WorkflowInstance', id: 'wfi_01', version: 0 },
  data: {},
};

describe('eventEnvelopeSchema', () => {
  it('accepts a full event envelope', () => {
    expect(eventEnvelopeSchema.safeParse(validEventEnvelope).success).toBe(
      true,
    );
  });
  it('accepts a envelope without causationId and metadata', () => {
    expect(eventEnvelopeSchema.safeParse(minimalEventEnvelope).success).toBe(
      true,
    );
  });
  it('rejects eventId is not ULID', () => {
    const res = {
      ...validEventEnvelope,
      eventId: 'siuu',
    };
    expect(eventEnvelopeSchema.safeParse(res).success).toBe(false);
  });
  it('rejects an eventType that is not dot-separated lowercase', () => {
    const res = {
      ...validEventEnvelope,
      eventType: 'caseCreated',
    };
    expect(eventEnvelopeSchema.safeParse(res).success).toBe(false);
  });
  it('rejects an extra field', () => {
    const res = {
      ...validEventEnvelope,
      extra: true,
    };
    expect(eventEnvelopeSchema.safeParse(res).success).toBe(false);
  });
  it('rejects an actor type outside the enum', () => {
    const res = {
      ...validEventEnvelope,
      actor: { type: 'siuu', id: 'usr_01' },
    };
    expect(eventEnvelopeSchema.safeParse(res).success).toBe(false);
  });
  it('rejects a zero eventVersion', () => {
    const res = {
      ...validEventEnvelope,
      eventVersion: 0,
    };
    expect(eventEnvelopeSchema.safeParse(res).success).toBe(false);
  });
  it('rejects a negative aggregate version', () => {
    const res = {
      ...validEventEnvelope,
      aggregate: { ...validEventEnvelope.aggregate, version: -1 },
    };
    expect(eventEnvelopeSchema.safeParse(res).success).toBe(false);
  });
});

describe('createEventEnvelopeSchema', () => {
  const caseCreatedDataSchema = z.strictObject({
    status: z.string().min(1),
  });
  const caseCreatedEventSchema = createEventEnvelopeSchema(
    caseCreatedDataSchema,
  );
  it('accepts data matching the given schema', () => {
    expect(caseCreatedEventSchema.safeParse(validEventEnvelope).success).toBe(
      true,
    );
  });
  it('rejects data that does not match the given schema', () => {
    const res = {
      ...validEventEnvelope,
      data: { status: 123 },
    };
    expect(caseCreatedEventSchema.safeParse(res).success).toBe(false);
  });
});
