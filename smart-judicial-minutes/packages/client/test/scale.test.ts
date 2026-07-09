import { describe, expect, it } from 'vitest';
import {
  highlightChunks,
  matchingSegmentIds,
  nearestSegmentIdByOffset,
} from '../src/features/transcript/search';
import { computeStatistics } from '../src/features/transcript/stats';
import type { TranscriptSegment } from '@smj/shared';

// Thousands of segments — a long, high-volume hearing.
const COUNT = 10_000;

function makeSegments(count: number): TranscriptSegment[] {
  const out: TranscriptSegment[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      id: `00000000-0000-0000-0000-${i.toString().padStart(12, '0')}`,
      sessionId: '00000000-0000-0000-0000-000000000000',
      speakerId: `Guest-${(i % 120) + 1}`, // 120 distinct speakers (100+ participants)
      speakerLabel: `متحدث ${(i % 120) + 1}`,
      speakerRole: 'unassigned',
      text: i === 7777 ? 'علامة فريدة هنا' : `مداخلة رقم ${i} بنص عربي`,
      timestamp: new Date(1_700_000_000_000 + i * 4000).toISOString(),
      offsetMs: i * 4000,
      durationMs: 3500,
      isFinal: true,
    });
  }
  return out;
}

describe('transcript helpers at scale', () => {
  const segments = makeSegments(COUNT);

  it('computes statistics over 10k segments with 100+ speakers quickly', () => {
    const start = performance.now();
    const stats = computeStatistics(segments);
    const ms = performance.now() - start;
    expect(stats.phrases).toBe(COUNT);
    expect(stats.speakers).toBe(120);
    expect(stats.words).toBeGreaterThan(COUNT * 3);
    expect(ms).toBeLessThan(500);
  });

  it('finds a unique match among 10k segments', () => {
    const ids = matchingSegmentIds(segments, 'علامة فريدة');
    expect(ids).toHaveLength(1);
    expect(ids[0]).toBe(segments[7777]!.id);
  });

  it('locates the nearest segment by offset in a long timeline', () => {
    // Offset between segment 5000 (20000000ms) and 5001.
    const id = nearestSegmentIdByOffset(segments, 20_001_000);
    expect(id).toBe(segments[5000]!.id);
  });

  it('highlights without pathological slowdown on long text', () => {
    const long = 'الجلسة '.repeat(5000);
    const start = performance.now();
    const chunks = highlightChunks(long, 'الجلسة');
    const ms = performance.now() - start;
    expect(chunks.filter((c) => c.match)).toHaveLength(5000);
    expect(ms).toBeLessThan(500);
  });
});
