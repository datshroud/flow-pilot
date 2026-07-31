import { z } from 'zod';

export const userStatusSchema = z.enum(['ACTIVE', 'DISABLED']);

export const registerRequestSchema = z.strictObject({
  email: z.email().trim().toLowerCase().max(254),
  password: z.string().min(12).max(128),
  displayName: z.string().trim().min(1).max(100),
});

export const userResponseSchema = z.strictObject({
  id: z.string().min(1),
  email: z.email(),
  displayName: z.string().min(1),
  status: userStatusSchema,
  createdAt: z.iso.datetime(),
});

export const loginRequestSchema = z.strictObject({
  email: z.email().trim().toLowerCase().max(254),
  password: z.string().min(1).max(128),
});

export const accessTokenResponseSchema = z.strictObject({
  accessToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number().int().positive(),
});

export type UserStatus = z.infer<typeof userStatusSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type AccessTokenResponse = z.infer<typeof accessTokenResponseSchema>;
