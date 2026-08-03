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
  findByEmail(email: string): Promise<UserCredentials | null>;
}

export interface PasswordHasher {
  hash(plainPassword: string): Promise<string>;
  verify(passwordHash: string, plainPassword: string): Promise<boolean>;
}

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('Email is already registered');
    this.name = 'EmailAlreadyRegisteredError';
  }
}

export interface UserCredentials {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly status: 'ACTIVE' | 'DISABLED';
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}
