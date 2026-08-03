import { z } from 'zod';

const configSchema = z.object({
  IDENTITY_DATABASE_URL: z.url(),
  IDENTITY_PORT: z.coerce.number().int().positive().default(4101),

  IDENTITY_JWT_PRIVATE_KEY: z.string().min(1),
  IDENTITY_JWT_ISSUER: z.string().min(1).default('flowpilot-identity'),
  IDENTITY_JWT_AUDIENCE: z.string().min(1).default('flowpilot'),
  IDENTITY_ACCESS_TOKEN_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(900),

  IDENTITY_REFRESH_TOKEN_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(2_592_000),
});

export interface Config {
  readonly databaseUrl: string;
  readonly port: number;

  readonly jwtPrivateKey: string;
  readonly jwtIssuer: string;
  readonly jwtAudience: string;
  readonly accessTokenTtlSeconds: number;
  readonly refreshTokenTtlSeconds: number;
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

    jwtPrivateKey: res.data.IDENTITY_JWT_PRIVATE_KEY,
    jwtIssuer: res.data.IDENTITY_JWT_ISSUER,
    jwtAudience: res.data.IDENTITY_JWT_AUDIENCE,
    accessTokenTtlSeconds: res.data.IDENTITY_ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenTtlSeconds: res.data.IDENTITY_REFRESH_TOKEN_TTL_SECONDS,
  };
};
