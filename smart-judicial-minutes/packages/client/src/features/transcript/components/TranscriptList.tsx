import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Text, makeStyles, tokens } from '@fluentui/react-components';
import type { JudicialRole, TranscriptSegment } from '@smj/shared';
import { AR } from '../../../strings';
import { SegmentRow } from './SegmentRow';
import type { Participant } from '../types';

const useStyles = makeStyles({
  scroll: { flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative' },
  inner: { width: '100%', position: 'relative' },
  item: { position: 'absolute', insetInlineStart: 0, insetInlineEnd: 0, top: 0 },
  empty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
    paddingInline: tokens.spacingHorizontalXXXL,
    paddingBlock: tokens.spacingVerticalXXXL,
  },
});

interface TranscriptListProps {
  segments: TranscriptSegment[];
  participants: Participant[];
  searchTerm: string;
  matchIds: string[];
  activeMatchId: string | null;
  autoScroll: boolean;
  /** Segment to scroll into view when a bookmark is opened. */
  focusSegmentId: string | null;
  /** Bumped each time a bookmark jump is requested, to force a re-scroll. */
  focusNonce: number;
  onAssign: (speakerId: string, label: string, role: JudicialRole) => void;
}

/**
 * Virtualized, auto-following transcript. Only the visible rows are rendered so
 * long hearings stay smooth. Highlights all search matches and scrolls the
 * active match (or the newest line while live) into view.
 */
export function TranscriptList({
  segments,
  participants,
  searchTerm,
  matchIds,
  activeMatchId,
  autoScroll,
  focusSegmentId,
  focusNonce,
  onAssign,
}: TranscriptListProps) {
  const styles = useStyles();
  const scrollRef = useRef<HTMLDivElement>(null);
  const matchIdSet = useMemo(() => new Set(matchIds), [matchIds]);

  const virtualizer = useVirtualizer({
    count: segments.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 104,
    overscan: 10,
    getItemKey: (index) => segments[index]?.id ?? index,
  });

  // Follow the newest line while transcription is live and unsearched.
  useEffect(() => {
    if (autoScroll && !searchTerm && segments.length > 0) {
      virtualizer.scrollToIndex(segments.length - 1, { align: 'end' });
    }
  }, [segments.length, autoScroll, searchTerm, virtualizer]);

  // Bring the active search match into view.
  useLayoutEffect(() => {
    if (!activeMatchId) return;
    const index = segments.findIndex((s) => s.id === activeMatchId);
    if (index >= 0) virtualizer.scrollToIndex(index, { align: 'center' });
  }, [activeMatchId, segments, virtualizer]);

  // Jump to a bookmarked position (re-runs when focusNonce changes).
  useLayoutEffect(() => {
    if (!focusSegmentId) return;
    const index = segments.findIndex((s) => s.id === focusSegmentId);
    if (index >= 0) virtualizer.scrollToIndex(index, { align: 'center' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNonce]);

  if (segments.length === 0) {
    return (
      <div className={styles.empty}>
        <Text size={400}>{AR.waitingForSpeech}</Text>
      </div>
    );
  }

  return (
    <div className={styles.scroll} ref={scrollRef} role="log" aria-live="polite">
      <div className={styles.inner} style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((item) => {
          const segment = segments[item.index]!;
          return (
            <div
              key={item.key}
              className={styles.item}
              data-index={item.index}
              ref={virtualizer.measureElement}
              style={{ transform: `translateY(${item.start}px)` }}
            >
              <SegmentRow
                segment={segment}
                participants={participants}
                searchTerm={searchTerm}
                isActiveMatch={segment.id === activeMatchId && matchIdSet.has(segment.id)}
                onAssign={onAssign}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
