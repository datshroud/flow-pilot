import { z } from 'zod';

export const healthStatusSchema = z.enum(['ok', 'degraded']);

export const healthRespSchema = z
  .object({
    status: healthStatusSchema,
  })
  .strict();

export type HealthStatus = z.infer<typeof healthStatusSchema>;
export type HealthResp = z.infer<typeof healthRespSchema>;
