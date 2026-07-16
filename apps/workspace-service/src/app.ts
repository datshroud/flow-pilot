import express, { type Express } from 'express';
import { healthRespSchema, type HealthResp } from '@cognitive-guard/contracts';

export type ReadinessCheck = () => boolean | Promise<boolean>;

export interface AppOptions {
  readonly isReady?: ReadinessCheck;
}

const createHealthResp = (status: HealthResp['status']): HealthResp =>
  healthRespSchema.parse({ status });

export const createApp = ({
  isReady: readinessCheck = () => true,
}: AppOptions = {}): Express => {
  const app = express();
  app.disable('x-powered-by');

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
  return app;
};
