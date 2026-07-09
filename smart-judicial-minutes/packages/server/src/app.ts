import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { corsOrigins, env } from './config/env.js';
import { logger } from './lib/logger.js';
import { requestId } from './middleware/requestId.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { healthRouter } from './features/health/healthRoutes.js';
import { sessionRouter } from './features/sessions/sessionRoutes.js';
import { speechRouter } from './features/speech/speechRoutes.js';
import { auditRouter } from './features/audit/auditRoutes.js';

/**
 * Builds the Express application with the full security middleware chain.
 * Kept separate from server startup so it can be imported directly in tests.
 */
export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // Security headers. The app is embedded in a Teams webview, so framing by the
  // Teams/Office/SharePoint hosts must be permitted.
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'frame-ancestors': [
            "'self'",
            'https://teams.microsoft.com',
            'https://*.teams.microsoft.com',
            'https://*.skype.com',
            'https://*.office.com',
            'https://*.microsoft.com',
          ],
          'connect-src': [
            "'self'",
            'https://*.cognitive.microsoft.com',
            'wss://*.cognitiveservices.azure.com',
          ],
        },
      },
      crossOriginEmbedderPolicy: false,
      // HSTS: force HTTPS for a year, including subdomains, and eligible for preload.
      hsts: { maxAge: 31_536_000, includeSubDomains: true, preload: true },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      // Allow the page to be framed by Teams.
      frameguard: false,
    }),
  );

  // Permissions-Policy: only the microphone is needed (for live transcription).
  app.use((_req, res, next) => {
    res.setHeader('Permissions-Policy', 'microphone=(self), camera=(), geolocation=()');
    next();
  });

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      allowedHeaders: ['Authorization', 'Content-Type', 'x-request-id'],
      exposedHeaders: ['x-request-id'],
    }),
  );

  app.use(compression());
  app.use(requestId());
  app.use(
    pinoHttp({
      logger,
      // Reuse the correlation id assigned by the requestId middleware.
      genReqId: (req) => (req as { id?: string }).id ?? 'unknown',
    }),
  );

  // Global rate limiter. Fine-grained enough to protect the API without
  // throttling the segment-streaming path during an active hearing.
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Body parsing (JSON). The recording upload route registers its own raw
  // parser, so we cap JSON at a modest size here.
  app.use(express.json({ limit: '2mb' }));

  // Routes.
  app.use('/health', healthRouter);
  app.use('/api/speech', speechRouter);
  app.use('/api/sessions', sessionRouter);
  app.use('/api/audit', auditRouter);

  // 404 + error handling.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
