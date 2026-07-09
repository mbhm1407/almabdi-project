import { describe, expect, it } from 'vitest';
import {
  cycleIndex,
  highlightChunks,
  matchingSegmentIds,
  nearestSegmentIdByOffset,
} from '../src/features/transcript/search';
import type { TranscriptSegment } from '@smj/shared';

function seg(id: string, text: string, speakerLabel = 'القاضي'): TranscriptSegment {
  return {
    id,
    sessionId: '00000000-0000-0000-0000-000000000000',
    speakerId: 'Guest-1',
    speakerLabel,
    speakerRole: 'judge',
    text,
    timestamp: '2026-07-08T09:41:02.000Z',
    offsetMs: 0,
    durationMs: 1000,
    isFinal: true,
  };
}

describe('highlightChunks', () => {
  it('returns the whole text as a single non-match chunk when there is no term', () => {
    expect(highlightChunks('افتتحت الجلسة', '')).toEqual([{ text: 'افتتحت الجلسة', match: false }]);
  });

  it('splits the text around each occurrence of the term', () => {
    const chunks = highlightChunks('الجلسة ثم الجلسة', 'الجلسة');
    expect(chunks.filter((c) => c.match)).toHaveLength(2);
    expect(chunks.map((c) => c.text).join('')).toBe('الجلسة ثم الجلسة');
  });

  it('is case-insensitive for latin text', () => {
    const chunks = highlightChunks('Case ABC', 'abc');
    expect(chunks.some((c) => c.match && c.text === 'ABC')).toBe(true);
  });
});

describe('matchingSegmentIds', () => {
  const segments = [
    seg('11111111-1111-1111-1111-111111111111', 'افتتحت الجلسة.'),
    seg('22222222-2222-2222-2222-222222222222', 'أطالب بإلزام المدعى عليه.', 'المدعي'),
  ];

  it('returns ids of segments whose text matches', () => {
    expect(matchingSegmentIds(segments, 'أطالب')).toEqual(['22222222-2222-2222-2222-222222222222']);
  });

  it('matches on speaker label too', () => {
    expect(matchingSegmentIds(segments, 'المدعي')).toEqual([
      '22222222-2222-2222-2222-222222222222',
    ]);
  });

  it('returns nothing for an empty term', () => {
    expect(matchingSegmentIds(segments, '  ')).toEqual([]);
  });
});

describe('cycleIndex', () => {
  it('wraps forward past the end', () => {
    expect(cycleIndex(2, 1, 3)).toBe(0);
  });
  it('wraps backward past the start', () => {
    expect(cycleIndex(0, -1, 3)).toBe(2);
  });
  it('returns -1 for an empty list', () => {
    expect(cycleIndex(0, 1, 0)).toBe(-1);
  });
});

describe('nearestSegmentIdByOffset', () => {
  const at = (id: string, offsetMs: number): TranscriptSegment => ({
    id,
    sessionId: '00000000-0000-0000-0000-000000000000',
    speakerId: 'Guest-1',
    speakerLabel: 'Guest-1',
    speakerRole: 'unassigned',
    text: 'x',
    timestamp: '2026-07-08T09:41:02.000Z',
    offsetMs,
    durationMs: 1000,
    isFinal: true,
  });
  const segments = [at('a', 0), at('b', 5000), at('c', 12000)];

  it('returns the last segment at or before the offset', () => {
    expect(nearestSegmentIdByOffset(segments, 8000)).toBe('b');
    expect(nearestSegmentIdByOffset(segments, 12000)).toBe('c');
  });

  it('returns the first segment when the offset precedes all', () => {
    expect(nearestSegmentIdByOffset(segments, -1)).toBe('a');
  });

  it('returns null for an empty transcript', () => {
    expect(nearestSegmentIdByOffset([], 1000)).toBeNull();
  });
});
