export interface NewUser {
  readonly email: string;
  readonly passwordHash: string;
  readonly displayName: string;
}

export interface StoredUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly status: 'ACTIVE' | 'DISABLED';
  readonly createdAt: Date;
}

export interface UserRepository {
  create(user: NewUser): Promise<StoredUser>;
}

export interface PasswordHasher {
  hash(plainPassword: string): Promise<string>;
}

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('Email is already registered');
    this.name = 'EmailAlreadyRegisteredError';
  }
}
