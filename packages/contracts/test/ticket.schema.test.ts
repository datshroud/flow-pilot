import { describe, expect, it } from 'vitest';
import {
  createTicketRequestSchema,
  ticketCategorySchema,
  ticketResponseSchema,
} from '../src/ticket.schema.js';

const validCreateReq = {
  subject: 'Cannot log in after password reset',
  body: 'I reset my password this morning and the login page rejects it.',
  requestedPriority: 'HIGH',
};

const validTicketResp = {
  id: 'tkt_1',
  tenantId: 'ten_1',
  subject: 'Cannot log in after password reset',
  body: 'I reset my password this morning and the login page rejects it.',
  status: 'NEW',
  category: null,
  priority: null,
  requestedPriority: 'HIGH',
  assigneeId: null,
  createdAt: '2026-09-17T10:00:00.000Z',
  updatedAt: '2026-09-17T10:00:00.000Z',
  resolvedAt: null,
};

describe('createTicketRequestSchema', () => {
  it('accepts a valid create req', () => {
    expect(createTicketRequestSchema.safeParse(validCreateReq).success).toBe(
      true,
    );
  });

  it('accepts a req without requestedPriority', () => {
    const req = {
      subject: validCreateReq.subject,
      body: validCreateReq.body,
    };
    expect(createTicketRequestSchema.safeParse(req).success).toBe(true);
  });

  it('rejects an empty subject', () => {
    const req = {
      ...validCreateReq,
      subject: '',
    };
    expect(createTicketRequestSchema.safeParse(req).success).toBe(false);
  });
  it('rejects a subject of only whitespace', () => {
    const req = {
      ...validCreateReq,
      subject: '     ',
    };
    expect(createTicketRequestSchema.safeParse(req).success).toBe(false);
  });
  it('rejects a subjects longer than 200 characters', () => {
    const req = {
      ...validCreateReq,
      subject: 'a'.repeat(201),
    };
    expect(createTicketRequestSchema.safeParse(req).success).toBe(false);
  });
  it('rejects a body longer than 10000 characters', () => {
    const req = { ...validCreateReq, body: 'a'.repeat(10001) };
    expect(createTicketRequestSchema.safeParse(req).success).toBe(false);
  });

  it('rejects a requestedPriority outside the enum', () => {
    const req = { ...validCreateReq, requestedPriority: 'CRITICAL' };
    expect(createTicketRequestSchema.safeParse(req).success).toBe(false);
  });

  it('rejects a category smuggled into the request', () => {
    const req = { ...validCreateReq, category: 'billing' };
    expect(createTicketRequestSchema.safeParse(req).success).toBe(false);
  });
});

describe('ticketCategorySchema', () => {
  it('accepts a single-word slug', () => {
    expect(ticketCategorySchema.safeParse('billing').success).toBe(true);
  });
  it('accepts a multi-word slug', () => {
    expect(ticketCategorySchema.safeParse('billing-and-payments').success).toBe(
      true,
    );
  });
  it('accepts digits after the first letter', () => {
    expect(ticketCategorySchema.safeParse('tier2').success).toBe(true);
  });

  it('rejects uppercase letters', () => {
    expect(ticketCategorySchema.safeParse('Billing').success).toBe(false);
  });

  it('rejects underscores', () => {
    expect(ticketCategorySchema.safeParse('billing_payments').success).toBe(
      false,
    );
  });

  it('rejects a slug starting with a digit', () => {
    expect(ticketCategorySchema.safeParse('1billing').success).toBe(false);
  });

  it('rejects a trailing hyphen', () => {
    expect(ticketCategorySchema.safeParse('billing-').success).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(ticketCategorySchema.safeParse('').success).toBe(false);
  });

  it('rejects a slug longer than 50 characters', () => {
    expect(ticketCategorySchema.safeParse('a'.repeat(51)).success).toBe(false);
  });
});

describe('ticketResponseSchema', () => {
  it('accepts a freshly created, unclassified ticket', () => {
    expect(ticketResponseSchema.safeParse(validTicketResp).success).toBe(true);
  });
  it('accepts a fully triaged and assigned ticket', () => {
    const resp = {
      ...validTicketResp,
      status: 'ASSIGNED',
      category: 'billing-and-payments',
      priority: 'HIGH',
      assigneeId: 'usr_9',
    };
    expect(ticketResponseSchema.safeParse(resp).success).toBe(true);
  });
  it('rejects a response with the category field missing', () => {
    const resp = {
      id: validTicketResp.id,
      tenantId: validTicketResp.tenantId,
      subject: validTicketResp.subject,
      body: validTicketResp.body,
      status: validTicketResp.status,
      priority: validTicketResp.priority,
      requestedPriority: validTicketResp.requestedPriority,
      assigneeId: validTicketResp.assigneeId,
      createdAt: validTicketResp.createdAt,
      updatedAt: validTicketResp.updatedAt,
      resolvedAt: validTicketResp.resolvedAt,
    };
    expect(ticketResponseSchema.safeParse(resp).success).toBe(false);
  });

  it('rejects a non-ISO createdAt', () => {
    const resp = { ...validTicketResp, createdAt: '17/09/2026' };
    expect(ticketResponseSchema.safeParse(resp).success).toBe(false);
  });

  it('rejects an unknown field', () => {
    const resp = { ...validTicketResp, internalNote: 'nope' };
    expect(ticketResponseSchema.safeParse(resp).success).toBe(false);
  });
});
