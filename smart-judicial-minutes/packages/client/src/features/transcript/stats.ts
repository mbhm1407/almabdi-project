import type { TranscriptSegment } from '@smj/shared';

export interface HearingStats {
  /** Distinct diarized speakers seen so far. */
  speakers: number;
  /** Total words across finalized utterances. */
  words: number;
  /** Number of finalized utterances (phrases). */
  phrases: number;
  /** Wall-clock time of the most recent finalized utterance (ISO), or null. */
  lastUpdate: string | null;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Computes live hearing statistics from the finalized transcript segments. */
export function computeStatistics(segments: TranscriptSegment[]): HearingStats {
  const finals = segments.filter((s) => s.isFinal);
  const speakers = new Set(finals.map((s) => s.speakerId)).size;
  const words = finals.reduce((total, s) => total + countWords(s.text), 0);
  const last = finals[finals.length - 1];
  return {
    speakers,
    words,
    phrases: finals.length,
    lastUpdate: last ? last.timestamp : null,
  };
}
