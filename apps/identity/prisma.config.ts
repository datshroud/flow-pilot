import { defineConfig } from 'prisma/config';

try {
  process.loadEnvFile();
} catch {
  // No local .env file: environment variables come from the environment itself.
}

const url = process.env['IDENTITY_DATABASE_URL'];

export default defineConfig({
  schema: 'prisma/schema.prisma',
  ...(url === undefined ? {} : { datasource: { url } }),
});
