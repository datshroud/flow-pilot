import { z } from 'zod';

export const projectLanguageSchema = z.enum(['typescript', 'javascript']);

export const createProjectRequestSchema = z.strictObject({
  name: z.string().trim().min(1),
  repositoryUri: z.url().optional(),
  language: projectLanguageSchema,
});

export const projectResponseSchema = z.strictObject({
  id: z.uuid(),
  ...createProjectRequestSchema.shape,
  createdAt: z.iso.datetime(),
});

export type ProjectLanguage = z.infer<typeof projectLanguageSchema>;
export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>;
export type ProjectResponse = z.infer<typeof projectResponseSchema>;
