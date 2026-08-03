import { createApp } from './app.js';
import { createJoseTokenIssuer } from './auth/infrastructure/jose-token-issuer.js';
import { loadSigningKey } from './auth/infrastructure/signing-key.js';
import { loadConfig } from './config.js';
import { createPrismaClient } from './prisma.js';
import { argon2PasswordHasher } from './users/infrastructure/argon2-password-hasher.js';
import { createPrismaUserRepository } from './users/infrastructure/prisma-user-repository.js';

try {
  process.loadEnvFile();
} catch {
  // no local .env file
}

const config = loadConfig();
const signingKey = await loadSigningKey(config.jwtPrivateKey);
const prisma = createPrismaClient(config.databaseUrl);

const tokens = createJoseTokenIssuer(signingKey, {
  issuer: config.jwtIssuer,
  audience: config.jwtAudience,
  ttlSeconds: config.accessTokenTtlSeconds,
});

const app = createApp({
  users: createPrismaUserRepository(prisma),
  hasher: argon2PasswordHasher,
  publicJwk: signingKey.publicJwk,
  tokens,
  isReady: async () => {
    await prisma.$queryRaw`select 1`;
    return true;
  },
});

const server = app.listen(config.port, () => {
  console.log('Identity service listening on port', config.port);
});

const shutdown = (signal: string): void => {
  console.log('Shutting down on', signal);
  server.close(() => {
    void prisma.$disconnect().then(() => {
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  shutdown('SIGINT');
});
