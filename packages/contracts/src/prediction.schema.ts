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

export type PredictionTask = z.infer<typeof predictionTaskSchema>;
export type Confidence = z.infer<typeof confidenceSchema>;
export type DuplicateCandidate = z.infer<typeof duplicateCandidateSchema>;
export type PredictionResult = z.infer<typeof predictionResultSchema>;
