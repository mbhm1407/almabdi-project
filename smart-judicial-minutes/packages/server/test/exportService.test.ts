import { describe, expect, it } from 'vitest';
import { exportService } from '../src/features/transcripts/exportService.js';
import type { TranscriptionSession, TranscriptSegment } from '@smj/shared';

const session: TranscriptionSession = {
  id: '11111111-1111-1111-1111-111111111111',
  meetingId: 'meeting-1',
  meetingTitle: 'جلسة تجريبية',
  tenantId: 'tenant-1',
  createdBy: 'user-1',
  status: 'stopped',
  locale: 'ar-SA',
  startedAt: '2026-07-08T09:41:00.000Z',
  stoppedAt: '2026-07-08T10:10:00.000Z',
  recordingBlobName: null,
};

const segments: TranscriptSegment[] = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    sessionId: session.id,
    speakerId: 'Guest-1',
    speakerLabel: 'القاضي',
    text: 'افتتحت الجلسة.',
    timestamp: '2026-07-08T09:41:02.000Z',
    offsetMs: 2000,
    durationMs: 1500,
    isFinal: true,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    sessionId: session.id,
    speakerId: 'Guest-2',
    speakerLabel: 'المدعي',
    text: 'أطالب بإلزام المدعى عليه.',
    timestamp: '2026-07-08T09:41:30.000Z',
    offsetMs: 30000,
    durationMs: 2500,
    isFinal: true,
  },
];

describe('exportService', () => {
  it('produces a UTF-8 TXT transcript with speakers and text', () => {
    const result = exportService.export(session, segments, 'txt');
    const text = result.buffer.toString('utf-8');
    expect(result.contentType).toContain('text/plain');
    expect(result.filename).toMatch(/\.txt$/);
    expect(text).toContain('القاضي');
    expect(text).toContain('افتتحت الجلسة.');
    expect(text).toContain('المدعي');
  });

  it('produces a DOCX zip package with the correct magic bytes', () => {
    const result = exportService.export(session, segments, 'docx');
    expect(result.contentType).toContain('wordprocessingml');
    // ZIP local file header magic "PK\x03\x04".
    expect(result.buffer.subarray(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  });

  it('produces a PDF with a valid header and EOF marker', () => {
    const result = exportService.export(session, segments, 'pdf');
    expect(result.contentType).toBe('application/pdf');
    const head = result.buffer.subarray(0, 5).toString('latin1');
    expect(head).toBe('%PDF-');
    expect(result.buffer.toString('latin1')).toContain('%%EOF');
  });
});
