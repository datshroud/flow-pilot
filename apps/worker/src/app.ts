import express, { type Express } from 'express';
import { healthRespSchema, type HealthResp } from '@flowpilot/contracts';

export type ReadinessCheck = () => boolean | Promise<boolean>;

export interface AppOptions {
  readonly isReady?: ReadinessCheck;
}

const createHealthResp = (status: HealthResp['status']): HealthResp =>
  healthRespSchema.parse({ status });

/**
 * The worker's only HTTP surface is health (ADR-015). Job handlers are
 * driven by BullMQ, not by requests.
 */
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
