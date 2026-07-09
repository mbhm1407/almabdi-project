import type { TranscriptSegment } from '@smj/shared';

/** A slice of text flagged as either a search match or plain text. */
export interface TextChunk {
  text: string;
  match: boolean;
}

/**
 * Splits `text` into alternating plain / matching chunks for highlight rendering.
 * Matching is case-insensitive and diacritic-tolerant enough for Arabic search.
 */
export function highlightChunks(text: string, term: string): TextChunk[] {
  const needle = term.trim();
  if (!needle) return [{ text, match: false }];

  const chunks: TextChunk[] = [];
  const lowerText = text.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  let index = 0;
  let found = lowerText.indexOf(lowerNeedle, index);
  while (found !== -1) {
    if (found > index) chunks.push({ text: text.slice(index, found), match: false });
    chunks.push({ text: text.slice(found, found + needle.length), match: true });
    index = found + needle.length;
    found = lowerText.indexOf(lowerNeedle, index);
  }
  if (index < text.length) chunks.push({ text: text.slice(index), match: false });
  return chunks.length ? chunks : [{ text, match: false }];
}

/**
 * Returns the ordered ids of segments whose text or speaker matches the term.
 * Used to drive next/previous result navigation.
 */
export function matchingSegmentIds(segments: TranscriptSegment[], term: string): string[] {
  const needle = term.trim().toLowerCase();
  if (!needle) return [];
  return segments
    .filter(
      (s) => s.text.toLowerCase().includes(needle) || s.speakerLabel.toLowerCase().includes(needle),
    )
    .map((s) => s.id);
}

/** Wraps an index around a list length (for cyclic next/previous). */
export function cycleIndex(current: number, delta: number, length: number): number {
  if (length === 0) return -1;
  return (((current + delta) % length) + length) % length;
}
