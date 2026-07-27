import { defineConfig, env } from 'prisma/config';

process.loadEnvFile();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('IDENTITY_DATABASE_URL'),
  },
});
