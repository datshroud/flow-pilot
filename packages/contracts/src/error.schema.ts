import { z } from "zod";

// {
//   "error": {
//     "code": "PROJECT_NOT_FOUND",
//     "message": "Project does not exist",
//     "requestId": "01J...",
//     "details": []
//   }
// }

export const publicErrorSchema = z
    .object({
        "code": z.string().min(1),
        "message": z.string().min(1),
        "requestId": z.string().min(1),
        "details": z.array(z.unknown()),
    })
    .strict();

export const errorEnvelopeSchema = z
    .object({
        error: publicErrorSchema,
    })
    .strict();

export type PublicError = z.infer<typeof publicErrorSchema>;
export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;