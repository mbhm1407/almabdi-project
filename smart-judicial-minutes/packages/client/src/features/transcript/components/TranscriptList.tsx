import { useEffect, useMemo, useRef } from 'react';
import { Text, makeStyles, tokens } from '@fluentui/react-components';
import type { TranscriptSegment } from '@smj/shared';
import { SegmentRow } from './SegmentRow';

const useStyles = makeStyles({
  container: {
    flex: 1,
    overflowY: 'auto',
    paddingInline: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalS,
    display: 'flex',
    flexDirection: 'column',
  },
  empty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
    paddingInline: tokens.spacingHorizontalXXL,
  },
  highlight: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
    borderRadius: tokens.borderRadiusMedium,
  },
});

interface TranscriptListProps {
  segments: TranscriptSegment[];
  searchTerm: string;
  autoScroll: boolean;
  onRelabel: (speakerId: string, label: string) => void;
}

/** Scrollable, auto-following list of transcript lines with search filtering. */
export function TranscriptList({
  segments,
  searchTerm,
  autoScroll,
  onRelabel,
}: TranscriptListProps) {
  const styles = useStyles();
  const bottomRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const term = searchTerm.trim();
    if (!term) return segments;
    return segments.filter((s) => s.text.includes(term) || s.speakerLabel.includes(term));
  }, [segments, searchTerm]);

  useEffect(() => {
    if (autoScroll && !searchTerm) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [filtered.length, autoScroll, searchTerm]);

  if (segments.length === 0) {
    return (
      <div className={styles.empty}>
        <Text>اضغط «بدء النسخ المباشر» لبدء تحويل الكلام العربي إلى نص فوري أثناء الجلسة.</Text>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className={styles.empty}>
        <Text>لا توجد نتائج مطابقة لبحثك.</Text>
      </div>
    );
  }

  return (
    <div className={styles.container} role="log" aria-live="polite" aria-relevant="additions">
      {filtered.map((segment) => (
        <SegmentRow
          key={segment.id}
          segment={segment}
          interim={!segment.isFinal}
          onRelabel={onRelabel}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
