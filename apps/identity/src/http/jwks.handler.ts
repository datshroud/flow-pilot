import type { JWK } from 'jose';
import type { RequestHandler } from 'express';

export const createJwksHandler =
  (publicJwk: JWK): RequestHandler =>
  (_req, resp) => {
    resp.setHeader('cache-control', 'public, max-age=300');
    resp.status(200).json({ keys: [publicJwk] });
  };
