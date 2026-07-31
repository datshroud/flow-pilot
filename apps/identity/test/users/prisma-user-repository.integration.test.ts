import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/index.js';
import { createPrismaUserRepository } from '../../src/users/infrastructure/prisma-user-repository.js';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { EmailAlreadyRegisteredError } from '../../src/users/domain/ports.js';

try {
  process.loadEnvFile();
} catch {
  // No local .env file: environment variables come from the environment itself.
}

const databaseUrl = process.env['IDENTITY_DATABASE_URL'];

if (databaseUrl === undefined)
  throw new Error('IDENTITY_DATABASE_URL is required to run integration tests');

const FIXTURE_PREFIX = 'integration-test-';
const emailFor = (name: string) => `${FIXTURE_PREFIX}${name}@example.test`;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});
const users = createPrismaUserRepository(prisma);

const removeFixtures = async (): Promise<void> => {
  await prisma.user.deleteMany({
    where: { email: { startsWith: FIXTURE_PREFIX } },
  });
};

beforeEach(removeFixtures);

afterAll(async () => {
  await removeFixtures();
  await prisma.$disconnect();
});

describe('prismaUserRepository', () => {
  it('persists a user and returns the generated fields', async () => {
    const stored = await users.create({
      email: emailFor('persist'),
      passwordHash: '$argon2id$v=19$stub',
      displayName: 'Persisted',
    });
    expect(stored.id.length).toBeGreaterThan(0);
    expect(stored.email).toBe(emailFor('persist'));
    expect(stored.status).toBe('ACTIVE');
    expect(stored.createdAt).toBeInstanceOf(Date);
  });

  it('translates a duplicate email into EmailAlreadyRegisteredError', async () => {
    const user = {
      email: emailFor('duplicate'),
      passwordHash: '$argon2id$v=19$stub',
      displayName: 'First',
    };
    await users.create(user);
    await expect(users.create(user)).rejects.toBeInstanceOf(
      EmailAlreadyRegisteredError,
    );
  });

  it('lets only one of two concurrent registrations win', async () => {
    const user = {
      email: emailFor('race'),
      passwordHash: '$argon2id$v=19$stub',
      displayName: 'Racer',
    };
    const res = await Promise.allSettled([
      users.create(user),
      users.create(user),
    ]);
    const fulfilled = res.filter((res2) => res2.status === 'fulfilled');
    const rejected = res.filter(
      (res2): res2 is PromiseRejectedResult => res2.status === 'rejected',
    );
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]?.reason).toBeInstanceOf(EmailAlreadyRegisteredError);
  });

  it('does not expose the password hash through the port', async () => {
    const stored = await users.create({
      email: emailFor('nohash'),
      passwordHash: '$argon2id$v=19$secret-stub',
      displayName: 'No hash',
    });

    expect(JSON.stringify(stored)).not.toContain('secret-stub');
  });
});
