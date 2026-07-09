import { afterEach, describe, expect, it } from 'vitest';
import { transcriptBackup } from '../src/services/transcriptBackup';
import type { CreateSegmentInput } from '@smj/shared';

const sessionId = '11111111-1111-1111-1111-111111111111';

function seg(id: string, text: string): CreateSegmentInput {
  return {
    id,
    speakerId: 'Guest-1',
    speakerLabel: 'متحدث 1',
    speakerRole: 'unassigned',
    text,
    timestamp: '2026-07-08T09:41:02.000Z',
    offsetMs: 0,
    durationMs: 1000,
    isFinal: true,
  };
}

afterEach(() => {
  transcriptBackup.clear(sessionId);
});

describe('transcriptBackup (offline safety net)', () => {
  it('round-trips unsaved segments through storage', () => {
    const items = [
      seg('11111111-1111-1111-1111-111111111111', 'أ'),
      seg('22222222-2222-2222-2222-222222222222', 'ب'),
    ];
    transcriptBackup.save(sessionId, items);
    expect(transcriptBackup.load(sessionId)).toEqual(items);
  });

  it('clears the backup when nothing remains unsaved', () => {
    transcriptBackup.save(sessionId, [seg('11111111-1111-1111-1111-111111111111', 'أ')]);
    transcriptBackup.save(sessionId, []);
    expect(transcriptBackup.load(sessionId)).toEqual([]);
  });

  it('returns an empty array when there is no backup', () => {
    expect(transcriptBackup.load('99999999-9999-9999-9999-999999999999')).toEqual([]);
  });
});
