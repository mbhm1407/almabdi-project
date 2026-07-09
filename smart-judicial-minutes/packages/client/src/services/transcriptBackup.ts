import type { CreateSegmentInput } from '@smj/shared';

/**
 * Crash-safe local backup of segments that have not yet been persisted to the
 * server. Combined with the server's periodic save and in-memory retry queue,
 * this guarantees the clerk never loses transcript text — even if the tab
 * reloads or crashes between saves.
 */
const PREFIX = 'smj.unsaved.';

function key(sessionId: string): string {
  return `${PREFIX}${sessionId}`;
}

export const transcriptBackup = {
  save(sessionId: string, segments: CreateSegmentInput[]): void {
    try {
      if (segments.length === 0) {
        localStorage.removeItem(key(sessionId));
      } else {
        localStorage.setItem(key(sessionId), JSON.stringify(segments));
      }
    } catch {
      /* storage unavailable or quota exceeded — non-fatal */
    }
  },

  load(sessionId: string): CreateSegmentInput[] {
    try {
      const raw = localStorage.getItem(key(sessionId));
      return raw ? (JSON.parse(raw) as CreateSegmentInput[]) : [];
    } catch {
      return [];
    }
  },

  clear(sessionId: string): void {
    try {
      localStorage.removeItem(key(sessionId));
    } catch {
      /* non-fatal */
    }
  },
};
