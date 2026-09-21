import { describe, expect, it } from 'vitest';
import {
  confidenceSchema,
  predictionResultSchema,
  predictionTaskSchema,
  predictRequestSchema,
  predictResponseSchema,
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

const validPredictReq = {
  tenantId: 'ten_1',
  correlationId: 'cor_1',
  subject: 'Cannot log in after password reset',
  body: 'I reset my password this morning and the login page rejects it.',
  requestedPriority: 'HIGH',
  excludeTicketId: null,
  tasks: ['CATEGORY', 'PRIORITY'],
};

const validPredictResp = {
  correlationId: 'cor_1',
  predictions: [
    {
      modelVersionId: 'mv_1',
      latencyMs: 12,
      result: validCategory,
    },
    {
      modelVersionId: 'mv_2',
      latencyMs: 8,
      result: validPriority,
    },
  ],
  failures: [],
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

describe('predictRequestSchema', () => {
  it('accepts a valid request', () => {
    expect(predictRequestSchema.safeParse(validPredictReq).success).toBe(true);
  });
  it('accepts a request asking for a single task', () => {
    const req = {
      ...validPredictReq,
      tasks: ['DUPLICATE'],
    };
    expect(predictRequestSchema.safeParse(req).success).toBe(true);
  });
  it('accepts a null requestedPriority', () => {
    const req = {
      ...validPredictReq,
      requestedPriority: null,
    };
    expect(predictRequestSchema.safeParse(req).success).toBe(true);
  });
  it('accepts an excludeTicketId for rescoring', () => {
    const req = {
      ...validPredictReq,
      excludeTicketId: 'tkt_4',
    };
    expect(predictRequestSchema.safeParse(req).success).toBe(true);
  });
  it('rejects an empty tasks array', () => {
    const req = { ...validPredictReq, tasks: [] };
    expect(predictRequestSchema.safeParse(req).success).toBe(false);
  });

  it('rejects repeated tasks', () => {
    const req = { ...validPredictReq, tasks: ['CATEGORY', 'CATEGORY'] };
    expect(predictRequestSchema.safeParse(req).success).toBe(false);
  });

  it('rejects an unknown task', () => {
    const req = { ...validPredictReq, tasks: ['SENTIMENT'] };
    expect(predictRequestSchema.safeParse(req).success).toBe(false);
  });

  it('rejects an empty tenantId', () => {
    const req = { ...validPredictReq, tenantId: '' };
    expect(predictRequestSchema.safeParse(req).success).toBe(false);
  });

  it('rejects a subject of only whitespace', () => {
    const req = { ...validPredictReq, subject: '   ' };
    expect(predictRequestSchema.safeParse(req).success).toBe(false);
  });

  it('rejects a smuggled ticketId', () => {
    const req = { ...validPredictReq, ticketId: 'tkt_1' };
    expect(predictRequestSchema.safeParse(req).success).toBe(false);
  });
});

describe('predictResponseSchema', () => {
  it('accepts a response where every task succeeded', () => {
    expect(predictResponseSchema.safeParse(validPredictResp).success).toBe(
      true,
    );
  });
  it('accepts a partial response mixing results and failures', () => {
    const resp = {
      ...validPredictResp,
      failures: [
        {
          task: 'RESOLUTION_TIME',
          reason: 'NO_ACTIVE_MODEL',
        },
      ],
    };
    expect(predictResponseSchema.safeParse(resp).success).toBe(true);
  });
  it('accepts a response where every task failed', () => {
    const resp = {
      correlationId: 'cor_1',
      predictions: [],
      failures: [
        {
          task: 'RESOLUTION_TIME',
          reason: 'NO_ACTIVE_MODEL',
        },
        {
          task: 'PRIORITY',
          reason: 'TIMEOUT',
        },
      ],
    };
    expect(predictResponseSchema.safeParse(resp).success).toBe(true);
  });
  it('rejects a task appearing in both predictions and failures', () => {
    const resp = {
      ...validPredictResp,
      failures: [{ task: 'CATEGORY', reason: 'TIMEOUT' }],
    };
    expect(predictResponseSchema.safeParse(resp).success).toBe(false);
  });

  it('rejects the same task predicted twice', () => {
    const resp = {
      ...validPredictResp,
      predictions: [
        { modelVersionId: 'mv_1', latencyMs: 12, result: validCategory },
        { modelVersionId: 'mv_9', latencyMs: 30, result: validCategory },
      ],
    };
    expect(predictResponseSchema.safeParse(resp).success).toBe(false);
  });

  it('rejects a prediction without a model version', () => {
    const resp = {
      ...validPredictResp,
      predictions: [{ latencyMs: 12, result: validCategory }],
    };
    expect(predictResponseSchema.safeParse(resp).success).toBe(false);
  });

  it('rejects an empty model version id', () => {
    const resp = {
      ...validPredictResp,
      predictions: [
        { modelVersionId: '', latencyMs: 12, result: validCategory },
      ],
    };
    expect(predictResponseSchema.safeParse(resp).success).toBe(false);
  });

  it('rejects a negative latency', () => {
    const resp = {
      ...validPredictResp,
      predictions: [
        { modelVersionId: 'mv_1', latencyMs: -1, result: validCategory },
      ],
    };
    expect(predictResponseSchema.safeParse(resp).success).toBe(false);
  });

  it('rejects an unknown failure reason', () => {
    const resp = {
      ...validPredictResp,
      failures: [{ task: 'TOPIC', reason: 'MODEL_WAS_SAD' }],
    };
    expect(predictResponseSchema.safeParse(resp).success).toBe(false);
  });
});
