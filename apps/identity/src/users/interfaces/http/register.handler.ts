import type { RequestHandler } from 'express';
import type { PasswordHasher, UserRepository } from '../../domain/ports.js';
import {
  registerRequestSchema,
  userResponseSchema,
} from '@flowpilot/contracts';
import { registerUser } from '../../application/register-user.js';

export interface RegisterHandlerDeps {
  readonly users: UserRepository;
  readonly hasher: PasswordHasher;
}

export const createRegisterHandler =
  ({ users, hasher }: RegisterHandlerDeps): RequestHandler =>
  async (req, resp, next) => {
    try {
      const input = registerRequestSchema.parse(req.body);
      const user = await registerUser({ users, hasher }, input);

      resp.status(201).json(
        userResponseSchema.parse({
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          status: user.status,
          createdAt: user.createdAt.toISOString(),
        }),
      );
    } catch (err) {
      next(err);
    }
  };
