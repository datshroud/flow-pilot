import {
  InvalidCredentialsError,
  type PasswordHasher,
  type UserRepository,
} from '../../users/domain/ports.js';
import type { IssuedToken, TokenIssuer } from '../domain/ports.js';

export interface LoginUserInput {
  readonly email: string;
  readonly password: string;
}

export interface LoginUserDeps {
  readonly users: UserRepository;
  readonly hasher: PasswordHasher;
  readonly tokens: TokenIssuer;
}

export const loginUser = async (
  { users, hasher, tokens }: LoginUserDeps,
  input: LoginUserInput,
): Promise<IssuedToken> => {
  const user = await users.findByEmail(input.email);

  if (user === null) {
    await hasher.hash(input.password); // for equal real verification time
    throw new InvalidCredentialsError();
  }
  const passwordMatches = await hasher.verify(
    user.passwordHash,
    input.password,
  );
  if (!passwordMatches) throw new InvalidCredentialsError();
  if (user.status !== 'ACTIVE') throw new InvalidCredentialsError();
  return tokens.issueAccessToken(user.id);
};
