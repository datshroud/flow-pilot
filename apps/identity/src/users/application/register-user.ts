import type {
  NewUser,
  PasswordHasher,
  StoredUser,
  UserRepository,
} from '../domain/ports.js';

export interface RegisterUserInput {
  readonly email: string;
  readonly password: string;
  readonly displayName: string;
}

export interface RegisterUserDeps {
  readonly users: UserRepository;
  readonly hasher: PasswordHasher;
}

export const registerUser = async (
  { users, hasher }: RegisterUserDeps,
  input: RegisterUserInput,
): Promise<StoredUser> => {
  const newUser: NewUser = {
    email: input.email,
    passwordHash: await hasher.hash(input.password),
    displayName: input.displayName,
  };
  return users.create(newUser);
};
