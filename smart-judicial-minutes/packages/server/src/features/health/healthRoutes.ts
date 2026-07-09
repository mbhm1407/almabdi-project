import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { getPool } from '../../infrastructure/db/pool.js';

export const healthRouter = Router();

/** Liveness probe — process is up. */
healthRouter.get('/live', (_req, res) => {
  res.json({ status: 'ok' });
});

/** Readiness probe — dependencies (SQL) reachable. */
healthRouter.get(
  '/ready',
  asyncHandler(async (_req, res) => {
    const pool = await getPool();
    await pool.request().query('SELECT 1 AS ok');
    res.json({ status: 'ready' });
  }),
);
