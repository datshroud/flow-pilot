import type { RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';

export const REQUEST_ID_HEADER = 'x-request-id';

export const readRequestId = (locals: Record<string, unknown>): string => {
  const val: unknown = locals[REQUEST_ID_HEADER];
  return typeof val === 'string' && val.length > 0 ? val : 'unknown';
};

export const requestId = (): RequestHandler => (req, resp, next) => {
  const incoming = req.header(REQUEST_ID_HEADER);
  const id =
    incoming !== undefined && incoming.length > 0 ? incoming : randomUUID();

  resp.locals[REQUEST_ID_HEADER] = id;
  resp.setHeader(REQUEST_ID_HEADER, id);
  next();
};
