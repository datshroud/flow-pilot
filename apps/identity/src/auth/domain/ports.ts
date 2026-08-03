export interface IssuedToken {
  readonly accessToken: string;
  readonly expiresIn: number;
}
export interface TokenIssuer {
  issueAccessToken(userId: string): Promise<IssuedToken>;
}

export interface NewRefreshToken {
  readonly userId: string;
  readonly familyId: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
}

export interface StoredRefreshToken {
  readonly id: string;
  readonly userId: string;
  readonly familyId: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
  readonly usedAt: Date | null;
  readonly revokedAt: Date | null;
}

export interface RefreshTokenRepository {
  create(token: NewRefreshToken): Promise<StoredRefreshToken>;
  findByTokenHash(tokenHash: string): Promise<StoredRefreshToken | null>;
  markUsed(id: string, when: Date): Promise<void>;
  revokeFamily(familyId: string, when: Date): Promise<void>;
}
