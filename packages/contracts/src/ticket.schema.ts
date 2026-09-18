import z from 'zod';

export const ticketStatusSchema = z.enum([
  'NEW',
  'TRIAGED',
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING',
  'RESOLVED',
  'CLOSED',
]);

export const ticketPrioritySchema = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']);

export const ticketCategorySchema = z
  .string()
  .regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, 'must be a lowercase slug')
  .max(50);

export const createTicketRequestSchema = z.strictObject({
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10000),
  requestedPriority: ticketPrioritySchema.optional(),
});

export const ticketResponseSchema = z.strictObject({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  status: ticketStatusSchema,
  category: ticketCategorySchema.nullable(),
  priority: ticketPrioritySchema.nullable(),
  requestedPriority: ticketPrioritySchema.nullable(),
  assigneeId: z.string().min(1).nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  resolvedAt: z.iso.datetime().nullable(),
});

export type TicketStatus = z.infer<typeof ticketStatusSchema>;
export type TicketPriority = z.infer<typeof ticketPrioritySchema>;
export type TicketCategory = z.infer<typeof ticketCategorySchema>;
export type CreateTicketRequest = z.infer<typeof createTicketRequestSchema>;
export type TicketResponse = z.infer<typeof ticketResponseSchema>;
