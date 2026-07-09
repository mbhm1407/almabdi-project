import { z } from 'zod';

/** Standard error envelope returned by the API on failure. */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    /** Optional field-level validation details. */
    details: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
    /** Correlation id echoing the x-request-id header, for support/tracing. */
    requestId: z.string().optional(),
  }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export type ExportFormat = 'pdf' | 'docx' | 'txt';
export const exportFormatSchema = z.enum(['pdf', 'docx', 'txt']);
