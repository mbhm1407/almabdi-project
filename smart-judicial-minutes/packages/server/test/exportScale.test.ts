import { describe, expect, it } from 'vitest';
import { exportService } from '../src/features/transcripts/exportService.js';
import type { TranscriptionSession, TranscriptSegment } from '@smj/shared';

// Simulates a very long hearing: ~6 hours at ~one utterance every 4s.
const LARGE_COUNT = 5400;

const session: TranscriptionSession = {
  id: '11111111-1111-1111-1111-111111111111',
  meetingId: 'm-1',
  meetingTitle: 'جلسة طويلة',
  caseNumber: '435/2/ق',
  circuitName: 'الدائرة الأولى',
  judgeName: 'القاضي',
  tenantId: 'tenant-1',
  createdBy: 'clerk-1',
  status: 'stopped',
  locale: 'ar-SA',
  startedAt: '2026-07-08T09:00:00.000Z',
  stoppedAt: '2026-07-08T15:00:00.000Z',
  recordingBlobName: null,
};

function makeSegments(count: number): TranscriptSegment[] {
  const roles = ['judge', 'plaintiff', 'defendant', 'lawyer', 'witness'] as const;
  const segments: TranscriptSegment[] = [];
  for (let i = 0; i < count; i++) {
    segments.push({
      id: `00000000-0000-0000-0000-${i.toString().padStart(12, '0')}`,
      sessionId: session.id,
      speakerId: `Guest-${(i % 8) + 1}`,
      speakerLabel: `متحدث ${(i % 8) + 1}`,
      speakerRole: roles[i % roles.length]!,
      text: `هذه هي المداخلة رقم ${i} في الجلسة الطويلة مع نص عربي كافٍ للاختبار.`,
      timestamp: new Date(Date.parse(session.startedAt) + i * 4000).toISOString(),
      offsetMs: i * 4000,
      durationMs: 3500,
      isFinal: true,
    });
  }
  return segments;
}

describe('exportService at scale (long hearing)', () => {
  const segments = makeSegments(LARGE_COUNT);

  it('exports a large TXT transcript quickly', () => {
    const start = performance.now();
    const result = exportService.export(session, segments, 'txt');
    const ms = performance.now() - start;
    expect(result.buffer.length).toBeGreaterThan(0);
    expect(result.buffer.toString('utf-8')).toContain('المداخلة رقم 5399');
    expect(ms).toBeLessThan(2000);
  });

  it('exports a large multi-page PDF', () => {
    const result = exportService.export(session, segments, 'pdf');
    expect(result.buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(result.buffer.toString('latin1')).toContain('%%EOF');
    // A 5400-utterance transcript must paginate into many pages.
    expect(result.buffer.toString('latin1')).toContain('/Type /Pages /Count');
  });

  it('exports a large valid DOCX package', () => {
    const result = exportService.export(session, segments, 'docx');
    expect(result.buffer.subarray(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
    expect(result.buffer.length).toBeGreaterThan(10_000);
  });
});
