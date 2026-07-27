import { z } from 'zod';

const configSchema = z.object({
  IDENTITY_DATABASE_URL: z.url(),
  IDENTITY_PORT: z.coerce.number().int().positive().default(4101),
});

export interface Config {
  readonly databaseUrl: string;
  readonly port: number;
}

export const loadConfig = (env: NodeJS.ProcessEnv = process.env): Config => {
  const res = configSchema.safeParse(env);
  if (!res.success) {
    const detail = res.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid identity configuration - ${detail}`);
  }

  return {
    databaseUrl: res.data.IDENTITY_DATABASE_URL,
    port: res.data.IDENTITY_PORT,
  };
};
