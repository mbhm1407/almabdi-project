import { describe, expect, it } from 'vitest';
import { formatBytes } from '../src/services/format';
import { formatDuration, sessionDurationMs, judicialRoleLabel } from '@smj/shared';
import type { TranscriptionSession } from '@smj/shared';

describe('formatBytes', () => {
  it('formats zero and small sizes', () => {
    expect(formatBytes(0)).toBe('0 بايت');
    expect(formatBytes(512)).toContain('بايت');
  });
  it('formats kilobytes and megabytes', () => {
    expect(formatBytes(1024)).toContain('كيلوبايت');
    expect(formatBytes(5 * 1024 * 1024)).toContain('ميغابايت');
  });
});

describe('formatDuration', () => {
  it('formats milliseconds as HH:MM:SS', () => {
    expect(formatDuration(0)).toBe('00:00:00');
    expect(formatDuration(3_661_000)).toBe('01:01:01');
  });
});

describe('sessionDurationMs', () => {
  const base: TranscriptionSession = {
    id: '11111111-1111-1111-1111-111111111111',
    meetingId: 'm',
    meetingTitle: 't',
    caseNumber: null,
    tenantId: 'tenant',
    createdBy: 'user',
    status: 'stopped',
    locale: 'ar-SA',
    startedAt: '2026-07-08T09:00:00.000Z',
    stoppedAt: '2026-07-08T09:30:00.000Z',
    recordingBlobName: null,
  };

  it('uses the stop time when the session has ended', () => {
    expect(sessionDurationMs(base)).toBe(30 * 60 * 1000);
  });

  it('measures against now for an active session', () => {
    const active = { ...base, status: 'active' as const, stoppedAt: null };
    const now = new Date('2026-07-08T09:10:00.000Z').getTime();
    expect(sessionDurationMs(active, now)).toBe(10 * 60 * 1000);
  });
});

describe('judicialRoleLabel', () => {
  it('maps roles to Arabic labels', () => {
    expect(judicialRoleLabel('judge')).toBe('القاضي');
    expect(judicialRoleLabel('plaintiff')).toBe('المدعي');
    expect(judicialRoleLabel(null)).toBe('غير محدد');
  });
});
