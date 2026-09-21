import { describe, expect, it } from 'vitest';
import {
  confidenceSchema,
  predictionResultSchema,
  predictionTaskSchema,
  type PredictionTask,
} from '../src/prediction.schema.js';

const validConfidence = {
  value: 0.82,
  calibrated: true,
};

const validCategory = {
  task: 'CATEGORY',
  value: 'billing-and-payments',
  confidence: validConfidence,
};

const validPriority = {
  task: 'PRIORITY',
  value: 'HIGH',
  confidence: validConfidence,
};

const validResolutionTime = {
  task: 'RESOLUTION_TIME',
  estimatedHours: 18.5,
};

const validDuplicate = {
  task: 'DUPLICATE',
  candidates: [
    { ticketId: 'tkt_2', similarity: 0.91 },
    { ticketId: 'tkt_7', similarity: 0.74 },
  ],
};

const validTopic = {
  task: 'TOPIC',
  clusterId: 3,
  distance: 0.42,
};

const validEscalationRisk = {
  task: 'ESCALATION_RISK',
  confidence: validConfidence,
  threshold: 0.31,
  willEscalate: true,
};

describe('predictResultSchema', () => {
  it('accepts a category prediction', () => {
    expect(predictionResultSchema.safeParse(validCategory).success).toBe(true);
  });
  it('accepts a priority prediction', () => {
    expect(predictionResultSchema.safeParse(validPriority).success).toBe(true);
  });
  it('accepts a resolution time prediction', () => {
    expect(predictionResultSchema.safeParse(validResolutionTime).success).toBe(
      true,
    );
  });

  it('accepts a duplicate prediction', () => {
    expect(predictionResultSchema.safeParse(validDuplicate).success).toBe(true);
  });

  it('accepts a duplicate prediction with no candidates', () => {
    const result = { task: 'DUPLICATE', candidates: [] };
    expect(predictionResultSchema.safeParse(result).success).toBe(true);
  });

  it('accepts a topic prediction', () => {
    expect(predictionResultSchema.safeParse(validTopic).success).toBe(true);
  });

  it('accepts an escalation risk prediction', () => {
    expect(predictionResultSchema.safeParse(validEscalationRisk).success).toBe(
      true,
    );
  });
  it('rejects an unknown task', () => {
    const res = {
      task: 'STUPID',
      value: '123',
    };
    expect(predictionResultSchema.safeParse(res).success).toBe(false);
  });
  it('rejects a regression result carrying a confidence', () => {
    const res = {
      ...validResolutionTime,
      confidence: validConfidence,
    };
    expect(predictionResultSchema.safeParse(res).success).toBe(false);
  });
  it('rejects a category res carrying estimated hours', () => {
    const res = {
      ...validCategory,
      estimatedHours: 4,
    };
    expect(predictionResultSchema.safeParse(res).success).toBe(false);
  });
  it('rejects a topic res whose distance is called confidence', () => {
    const res = {
      task: 'TOPIC',
      clusterId: 3,
      confidence: validConfidence,
    };
    expect(predictionResultSchema.safeParse(res).success).toBe(false);
  });
  it('rejects a non-slug category value', () => {
    const result = { ...validCategory, value: 'Billing And Payments' };
    expect(predictionResultSchema.safeParse(result).success).toBe(false);
  });

  it('rejects a zero estimatedHours', () => {
    const result = { ...validResolutionTime, estimatedHours: 0 };
    expect(predictionResultSchema.safeParse(result).success).toBe(false);
  });

  it('rejects a negative estimatedHours', () => {
    const result = { ...validResolutionTime, estimatedHours: -3 };
    expect(predictionResultSchema.safeParse(result).success).toBe(false);
  });

  it('rejects more than ten duplicate candidates', () => {
    const result = {
      task: 'DUPLICATE',
      candidates: Array.from({ length: 11 }, (_unused, index) => ({
        ticketId: `tkt_${String(index)}`,
        similarity: 0.5,
      })),
    };
    expect(predictionResultSchema.safeParse(result).success).toBe(false);
  });

  it('rejects a similarity above one', () => {
    const result = {
      task: 'DUPLICATE',
      candidates: [{ ticketId: 'tkt_2', similarity: 1.4 }],
    };
    expect(predictionResultSchema.safeParse(result).success).toBe(false);
  });

  it('rejects a non-integer clusterId', () => {
    const result = { ...validTopic, clusterId: 2.5 };
    expect(predictionResultSchema.safeParse(result).success).toBe(false);
  });

  it('rejects a negative distance', () => {
    const result = { ...validTopic, distance: -0.1 };
    expect(predictionResultSchema.safeParse(result).success).toBe(false);
  });
    it('covers every task declared in predictionTaskSchema', () => {
        const fixtures: Record<PredictionTask, unknown> = {
            CATEGORY: validCategory,
            PRIORITY: validPriority,
            RESOLUTION_TIME: validResolutionTime,
            DUPLICATE: validDuplicate,
            TOPIC: validTopic,
            ESCALATION_RISK: validEscalationRisk,
        };

        for (const task of predictionTaskSchema.options) {
            expect(predictionResultSchema.safeParse(fixtures[task]).success).toBe(
                true,
            );
        }
    });
});

describe('confidenceSchema', () => {
  it('accepts a calibrated confidence', () => {
    expect(confidenceSchema.safeParse(validConfidence).success).toBe(true);
  });

  it('accepts an uncalibrated confidence', () => {
    const confidence = { value: 0.6, calibrated: false };
    expect(confidenceSchema.safeParse(confidence).success).toBe(true);
  });

  it('rejects a confidence without the calibrated flag', () => {
    const confidence = { value: 0.6 };
    expect(confidenceSchema.safeParse(confidence).success).toBe(false);
  });

  it('rejects a value above one', () => {
    const confidence = { ...validConfidence, value: 1.2 };
    expect(confidenceSchema.safeParse(confidence).success).toBe(false);
  });

  it('rejects a negative value', () => {
    const confidence = { ...validConfidence, value: -0.1 };
    expect(confidenceSchema.safeParse(confidence).success).toBe(false);
  });
});
