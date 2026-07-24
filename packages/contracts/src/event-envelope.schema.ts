import { z } from 'zod';

export const actorTypeSchema = z.enum(['USER', 'AGENT', 'SYSTEM']);

export const eventActorSchema = z.strictObject({
  type: actorTypeSchema,
  id: z.string().min(1),
});

export const eventAggregateSchema = z.strictObject({
  type: z.string().min(1),
  id: z.string().min(1),
  version: z.number().int().nonnegative(),
});

const ulidSchema = z
  .string()
  .regex(/^[0-9A-HJKMNP-TV-Z]{26}$/, 'must be a ULID');

export const eventEnvelopeSchema = z.strictObject({
  eventId: ulidSchema,
  eventType: z
    .string()
    .regex(/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/, 'dot-separated lowercase'),
  eventVersion: z.number().int().positive(),
  occurredAt: z.iso.datetime(),
  producer: z.string().min(1),
  tenantId: z.string().min(1),
  actor: eventActorSchema,
  correlationId: z.string().min(1),
  causationId: z.string().min(1).optional(),
  aggregate: eventAggregateSchema,
  data: z.unknown(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const createEventEnvelopeSchema = <TData extends z.ZodType>(
  dataSchema: TData,
) => eventEnvelopeSchema.extend({ data: dataSchema });

export type ActorType = z.infer<typeof actorTypeSchema>;
export type EventActor = z.infer<typeof eventActorSchema>;
export type EventAggregate = z.infer<typeof eventAggregateSchema>;
export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;
