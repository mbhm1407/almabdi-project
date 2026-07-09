import { describe, expect, it } from 'vitest';
import { computeStatistics } from '../src/features/transcript/stats';
import type { TranscriptSegment } from '@smj/shared';

function seg(
  id: string,
  speakerId: string,
  text: string,
  isFinal = true,
  timestamp = '2026-07-08T09:41:02.000Z',
): TranscriptSegment {
  return {
    id,
    sessionId: '00000000-0000-0000-0000-000000000000',
    speakerId,
    speakerLabel: speakerId,
    speakerRole: 'unassigned',
    text,
    timestamp,
    offsetMs: 0,
    durationMs: 1000,
    isFinal,
  };
}

describe('computeStatistics', () => {
  it('counts distinct speakers, words and phrases from finalized segments', () => {
    const stats = computeStatistics([
      seg('11111111-1111-1111-1111-111111111111', 'Guest-1', 'افتتحت الجلسة الآن'),
      seg('22222222-2222-2222-2222-222222222222', 'Guest-2', 'أطالب بإلزام المدعى عليه'),
      seg('33333333-3333-3333-3333-333333333333', 'Guest-1', 'تم'),
    ]);
    expect(stats.speakers).toBe(2);
    expect(stats.phrases).toBe(3);
    expect(stats.words).toBe(3 + 4 + 1);
  });

  it('ignores interim (non-final) segments', () => {
    const stats = computeStatistics([
      seg('11111111-1111-1111-1111-111111111111', 'Guest-1', 'نهائي'),
      seg('22222222-2222-2222-2222-222222222222', 'Guest-1', 'مؤقت جدا', false),
    ]);
    expect(stats.phrases).toBe(1);
    expect(stats.words).toBe(1);
  });

  it('reports the timestamp of the latest finalized segment', () => {
    const stats = computeStatistics([
      seg('11111111-1111-1111-1111-111111111111', 'Guest-1', 'أ', true, '2026-07-08T09:41:02.000Z'),
      seg('22222222-2222-2222-2222-222222222222', 'Guest-1', 'ب', true, '2026-07-08T09:45:00.000Z'),
    ]);
    expect(stats.lastUpdate).toBe('2026-07-08T09:45:00.000Z');
  });

  it('returns zeros for an empty transcript', () => {
    const stats = computeStatistics([]);
    expect(stats).toEqual({ speakers: 0, words: 0, phrases: 0, lastUpdate: null });
  });
});
