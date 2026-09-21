import { z } from 'zod';
import { ticketCategorySchema, ticketPrioritySchema } from './ticket.schema.js';

export const predictionTaskSchema = z.enum([
  'CATEGORY',
  'PRIORITY',
  'RESOLUTION_TIME',
  'DUPLICATE',
  'TOPIC',
  'ESCALATION_RISK',
]);

export const confidenceSchema = z.strictObject({
  value: z.number().min(0).max(1),
  calibrated: z.boolean(),
});

export const duplicateCandidateSchema = z.strictObject({
  ticketId: z.string().min(1),
  similarity: z.number().min(0).max(1),
});

const categoryPredictionSchema = z.strictObject({
  task: z.literal('CATEGORY'),
  value: ticketCategorySchema,
  confidence: confidenceSchema,
});

const priorityPredictionSchema = z.strictObject({
  task: z.literal('PRIORITY'),
  value: ticketPrioritySchema,
  confidence: confidenceSchema,
});

const resolutionTimePredictionSchema = z.strictObject({
  task: z.literal('RESOLUTION_TIME'),
  estimatedHours: z
    .number()
    .positive()
    .max(24 * 365),
});

const duplicatePredictionSchema = z.strictObject({
  task: z.literal('DUPLICATE'),
  candidates: z.array(duplicateCandidateSchema).max(10),
});

const topicPredictionSchema = z.strictObject({
  task: z.literal('TOPIC'),
  clusterId: z.number().int().nonnegative(),
  distance: z.number().nonnegative(),
});

const escalationRiskPredictionSchema = z.strictObject({
  task: z.literal('ESCALATION_RISK'),
  confidence: confidenceSchema,
  threshold: z.number().min(0).max(1),
  willEscalate: z.boolean(),
});

export const predictionResultSchema = z.discriminatedUnion('task', [
  categoryPredictionSchema,
  priorityPredictionSchema,
  resolutionTimePredictionSchema,
  duplicatePredictionSchema,
  topicPredictionSchema,
  escalationRiskPredictionSchema,
]);

export const predictRequestSchema = z.strictObject({
  tenantId: z.string().min(1),
  correlationId: z.string().min(1),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10000),
  requestedPriority: ticketPrioritySchema.nullable(),
  excludeTicketId: z.string().min(1).nullable(),
  tasks: z
    .array(predictionTaskSchema)
    .min(1)
    .refine((tasks) => new Set(tasks).size === tasks.length, {
      message: 'tasks must not repeat',
    }),
});

export const predictionFailureReasonSchema = z.enum([
  'NO_ACTIVE_MODEL',
  'TIMEOUT',
  'INTERNAL_ERROR',
]);

export const predictionFailureSchema = z.strictObject({
  task: predictionTaskSchema,
  reason: predictionFailureReasonSchema,
});

export const predictionSchema = z.strictObject({
  modelVersionId: z.string().min(1),
  latencyMs: z.number().nonnegative(),
  result: predictionResultSchema,
});

export const predictResponseSchema = z
  .strictObject({
    correlationId: z.string().min(1),
    predictions: z.array(predictionSchema),
    failures: z.array(predictionFailureSchema),
  })
  .refine(
    (resp) => {
      const tasks = [
        ...resp.predictions.map((prediction) => prediction.result.task),
        ...resp.failures.map((failure) => failure.task),
      ];
      return new Set(tasks).size === tasks.length;
    },
    {
      message: 'a task may appear at most once across predictions and failures',
    },
  );

export type PredictionTask = z.infer<typeof predictionTaskSchema>;
export type Confidence = z.infer<typeof confidenceSchema>;
export type DuplicateCandidate = z.infer<typeof duplicateCandidateSchema>;
export type PredictionResult = z.infer<typeof predictionResultSchema>;
export type PredictRequest = z.infer<typeof predictRequestSchema>;
export type PredictionFailureReason = z.infer<
  typeof predictionFailureReasonSchema
>;
export type PredictionFailure = z.infer<typeof predictionFailureSchema>;
export type Prediction = z.infer<typeof predictionSchema>;
export type PredictResponse = z.infer<typeof predictResponseSchema>;
