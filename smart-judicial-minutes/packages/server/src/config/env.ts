import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

/**
 * Strongly-typed, validated environment configuration. The process refuses to
 * start if anything required is missing or malformed — no silent fallbacks.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3978),
  /** Comma-separated list of allowed CORS origins (the Teams client host). */
  CORS_ORIGINS: z.string().default('https://teams.microsoft.com'),

  // ---- Microsoft Entra ID (token validation) ----
  ENTRA_TENANT_ID: z.string().min(1),
  /** Application (client) id of this API's app registration — the token audience. */
  ENTRA_API_CLIENT_ID: z.string().min(1),
  /** Custom scope exposed by the API (e.g. access_as_user). */
  ENTRA_API_SCOPE: z.string().default('access_as_user'),

  // ---- Azure Speech ----
  AZURE_SPEECH_KEY: z.string().min(1),
  AZURE_SPEECH_REGION: z.string().min(1),
  SPEECH_LOCALE: z.string().default('ar-SA'),

  // ---- Azure SQL ----
  SQL_SERVER: z.string().min(1),
  SQL_DATABASE: z.string().min(1),
  SQL_USER: z.string().optional(),
  SQL_PASSWORD: z.string().optional(),
  /** When true, authenticate to Azure SQL with the managed identity instead of user/pass. */
  SQL_USE_MANAGED_IDENTITY: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  SQL_ENCRYPT: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),

  // ---- Azure Blob Storage ----
  BLOB_ACCOUNT_NAME: z.string().min(1),
  BLOB_CONTAINER: z.string().default('recordings'),
  /** Optional connection string; when absent we use managed identity + account name. */
  BLOB_CONNECTION_STRING: z.string().optional(),

  // ---- Rate limiting ----
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === 'production';
export const corsOrigins = env.CORS_ORIGINS.split(',')
  .map((o) => o.trim())
  .filter(Boolean);
