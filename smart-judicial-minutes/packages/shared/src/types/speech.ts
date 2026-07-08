import { z } from 'zod';

/**
 * Short-lived authorization token issued by the backend so the browser can talk
 * to Azure Speech directly without ever seeing the subscription key.
 */
export const speechTokenSchema = z.object({
  token: z.string().min(1),
  region: z.string().min(1),
  /** Recognition locale, always ar-SA here. */
  locale: z.string(),
  /** Seconds until the token expires (Azure STS tokens live ~10 minutes). */
  expiresInSeconds: z.number().int().positive(),
});

export type SpeechToken = z.infer<typeof speechTokenSchema>;
