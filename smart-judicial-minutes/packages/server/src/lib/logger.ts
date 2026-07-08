import { pino } from 'pino';
import { env, isProduction } from '../config/env.js';

/**
 * Application logger. Structured JSON in production; pretty, human-readable
 * output in development is left to `pino-pretty` if the developer pipes it.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'smj-server' },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      '*.password',
      'token',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: isProduction
    ? undefined
    : {
        level: (label) => ({ level: label }),
      },
});

export type Logger = typeof logger;
