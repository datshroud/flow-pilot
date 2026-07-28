import { Prisma, PrismaClient } from '../../../generated/prisma/index.js';
import {
  EmailAlreadyRegisteredError,
  type NewUser,
  type StoredUser,
  type UserRepository,
} from '../domain/ports.js';

const isUniqueViolation = (err: unknown): boolean =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code == 'P2002';

export const createPrismaUserRepository = (
  prisma: PrismaClient,
): UserRepository => ({
  create: async (user: NewUser): Promise<StoredUser> => {
    try {
      const created = await prisma.user.create({ data: user });
      return {
        id: created.id,
        email: created.email,
        displayName: created.displayName,
        status: created.status,
        createdAt: created.createdAt,
      };
    } catch (err) {
      if (isUniqueViolation(err)) throw new EmailAlreadyRegisteredError();
      throw err;
    }
  },
});
