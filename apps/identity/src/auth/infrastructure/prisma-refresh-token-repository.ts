import { PrismaClient } from '../../../generated/prisma/index.js';
import type {
  NewRefreshToken,
  RefreshTokenRepository,
  StoredRefreshToken,
} from '../domain/ports.js';

interface RefreshTokenRow {
  readonly id: string;
  readonly userId: string;
  readonly familyId: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
  readonly usedAt: Date | null;
  readonly revokedAt: Date | null;
}

const toStored = (row: RefreshTokenRow): StoredRefreshToken => ({
  id: row.id,
  userId: row.userId,
  familyId: row.familyId,
  tokenHash: row.tokenHash,
  expiresAt: row.expiresAt,
  usedAt: row.usedAt,
  revokedAt: row.revokedAt,
});

export const createPrismaRefreshTokenRepository = (
  prisma: PrismaClient,
): RefreshTokenRepository => ({
  create: async (token: NewRefreshToken): Promise<StoredRefreshToken> =>
    toStored(await prisma.refreshToken.create({ data: token })),

  findByTokenHash: async (
    tokenHash: string,
  ): Promise<StoredRefreshToken | null> => {
    const res = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    return res === null ? null : toStored(res);
  },

  markUsed: async (id: string, when: Date): Promise<void> => {
    await prisma.refreshToken.update({
      where: { id },
      data: { used: when },
    });
  },

  revokeFamily: async (familyId: string, when: Date): Promise<void> => {
    await prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: when },
    });
  },
});
