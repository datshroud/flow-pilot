import type { RequestHandler } from 'express';
import { loginUser, type LoginUserDeps } from '../../application/login-user.js';
import {
  accessTokenResponseSchema,
  loginRequestSchema,
} from '@flowpilot/contracts';

export const createLoginHandler =
  (deps: LoginUserDeps): RequestHandler =>
  async (req, resp, next) => {
    try {
      const input = loginRequestSchema.parse(req.body);
      const issued = await loginUser(deps, input);

      resp.status(200).json(
        accessTokenResponseSchema.parse({
          accessToken: issued.accessToken,
          tokenType: 'Bearer',
          expiresIn: issued.expiresIn,
        }),
      );
    } catch (err) {
      next(err);
    }
  };
