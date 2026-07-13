import { describe, it, expect } from 'vitest';
import { errorEnvelopeSchema } from '../src/error.schema.js';

const validErrorEnvelope = {
    error: {
        code: 'PROJECT_NOT_FOUND',
        message: 'Project does not exist',
        requestId: '01J00000000000000000000000',
        details: [],
    },
};

describe('errorEnvelopeSchema', () => {
    it('accepts the blueprint error envelope', () => {
        expect(errorEnvelopeSchema.parse(validErrorEnvelope))
            .toEqual(validErrorEnvelope);
    });

    it('rejects an empty error code', () => {
    expect(
      errorEnvelopeSchema.safeParse({
        error: {
          ...validErrorEnvelope.error,
          code: '',
        },
      }).success,
    ).toBe(false);
  });

    // it('rejects an empty error message', () => {
    //     expect(
    //     errorEnvelopeSchema.safeParse({
    //         error: {
    //         ...validErrorEnvelope.error,
    //         message: '',
    //         },
    //     }).success,
    //     ).toBe(false);
    // });

    // it('rejects a missing requestId', () => {
    //     expect(
    //     errorEnvelopeSchema.safeParse({
    //         error: {
    //         code: 'PROJECT_NOT_FOUND',
    //         message: 'Project does not exist',
    //         details: [],
    //         },
    //     }).success,
    //     ).toBe(false);
    // });

    // it('rejects details that are not an array', () => {
    //     expect(
    //     errorEnvelopeSchema.safeParse({
    //         error: {
    //         ...validErrorEnvelope.error,
    //         details: {},
    //         },
    //     }).success,
    //     ).toBe(false);
    // });

    // it('rejects a leaked stack trace', () => {
    //     expect(
    //     errorEnvelopeSchema.safeParse({
    //         error: {
    //         ...validErrorEnvelope.error,
    //         stack: 'internal stack trace',
    //         },
    //     }).success,
    //     ).toBe(false);
    // });
});