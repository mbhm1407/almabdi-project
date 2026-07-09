import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

/**
 * Integration tests that exercise the full Express middleware chain (security
 * headers, auth guard, error handling) without external dependencies. Endpoints
 * that require the database or Azure are not hit — we assert the guard rails
 * that run before them.
 */
let app: Express;

beforeAll(async () => {
  vi.stubEnv('ENTRA_TENANT_ID', 'tenant');
  vi.stubEnv('ENTRA_API_CLIENT_ID', 'client');
  vi.stubEnv('AZURE_SPEECH_KEY', 'key');
  vi.stubEnv('AZURE_SPEECH_REGION', 'westeurope');
  vi.stubEnv('SQL_SERVER', 'sql');
  vi.stubEnv('SQL_DATABASE', 'db');
  vi.stubEnv('SQL_USER', 'u');
  vi.stubEnv('SQL_PASSWORD', 'p');
  vi.stubEnv('BLOB_ACCOUNT_NAME', 'acct');
  const { createApp } = await import('../src/app.js');
  app = createApp();
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe('health', () => {
  it('reports liveness', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('security headers', () => {
  it('sets hardening headers via helmet', async () => {
    const res = await request(app).get('/health/live');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toContain('frame-ancestors');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('authentication guard', () => {
  it('rejects protected session routes without a bearer token', async () => {
    const res = await request(app).get('/api/sessions?meetingId=m-1');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects the speech token route without a bearer token', async () => {
    const res = await request(app).get('/api/speech/token');
    expect(res.status).toBe(401);
  });

  it('rejects a malformed authorization header', async () => {
    const res = await request(app)
      .get('/api/sessions?meetingId=m-1')
      .set('Authorization', 'Basic abc');
    expect(res.status).toBe(401);
  });
});

describe('not found', () => {
  it('returns a structured 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
