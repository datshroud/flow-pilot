import express, { type Express } from 'express';
import { healthRespSchema, type HealthResp } from '@flowpilot/contracts';
import type { PasswordHasher, UserRepository } from './users/domain/ports.js';
import { requestId } from './http/request-id.js';
import { createRegisterHandler } from './users/interfaces/http/register.handler.js';
import { errorHandler, notFoundHandler } from './http/error-handler.js';

export type ReadinessCheck = () => boolean | Promise<boolean>;

export interface AppDeps {
  readonly users: UserRepository;
  readonly hasher: PasswordHasher;
  readonly isReady?: ReadinessCheck;
}

const createHealthResp = (status: HealthResp['status']): HealthResp =>
  healthRespSchema.parse({ status });

export const createApp = ({
  users,
  hasher,
  isReady: readinessCheck = () => true,
}: AppDeps): Express => {
  const app = express();
  app.disable('x-powered-by');
  app.use(requestId());
  app.use(express.json({ limit: '1mb' }));

  app.get('/health/live', (_req, resp) => {
    resp.status(200).json(createHealthResp('ok'));
  });

  app.get('/health/ready', async (_req, resp) => {
    try {
      const ready = await readinessCheck();
      const stt: HealthResp['status'] = ready ? 'ok' : 'degraded';
      resp.status(ready ? 200 : 503).json(createHealthResp(stt));
    } catch {
      resp.status(503).json(createHealthResp('degraded'));
    }
  });

  app.post('/v1/auth/register', createRegisterHandler({ users, hasher }));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
