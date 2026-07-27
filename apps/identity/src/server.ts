import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createPrismaClient } from './prisma.js';

try {
  process.loadEnvFile();
} catch {
  // no local .env file
}

const config = loadConfig();
const prisma = createPrismaClient(config.databaseUrl);

const app = createApp({
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
