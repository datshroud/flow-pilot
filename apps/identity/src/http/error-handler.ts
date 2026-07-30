import { errorEnvelopeSchema, type ErrorEnvelope } from '@flowpilot/contracts';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { readRequestId } from './request-id.js';
import { ZodError } from 'zod';
import { EmailAlreadyRegisteredError } from '../users/domain/ports.js';

const buildEnvelope = (
  code: string,
  message: string,
  requestId: string,
  details: readonly unknown[] = [],
): ErrorEnvelope =>
  errorEnvelopeSchema.parse({
    error: { code, message, requestId, details: [...details] },
  });

const isMalformedJson = (err: unknown): boolean =>
  err instanceof SyntaxError && 'body' in err;

export const notFoundHandler: RequestHandler = (_req, resp) => {
  resp
    .status(404)
    .json(
      buildEnvelope(
        'NOT_FOUND',
        'Resources not found',
        readRequestId(resp.locals),
      ),
    );
};

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req,
  resp,
  _next,
) => {
  const requestId = readRequestId(resp.locals);
  if (err instanceof ZodError) {
    resp
      .status(400)
      .json(
        buildEnvelope(
          'VALIDATION_FAILED',
          'Request validation failed',
          requestId,
          err.issues,
        ),
      );
    return;
  }
  if (isMalformedJson(err)) {
    resp
      .status(400)
      .json(
        buildEnvelope(
          'MALFORMED_JSON',
          'Request body is not valid JSON',
          requestId,
        ),
      );
    return;
  }
  if (err instanceof EmailAlreadyRegisteredError) {
    resp
      .status(409)
      .json(buildEnvelope('EMAIL_ALREADY_REGISTERED', err.message, requestId));
    return;
  }
  console.error('Unhandled error', { requestId, err });
  resp
    .status(500)
    .json(buildEnvelope('INTERNAL_ERROR', 'Unexpected error', requestId));
};
