import { memo, useState } from 'react';
import {
  Button,
  Caption1,
  Input,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import { EditRegular } from '@fluentui/react-icons';
import type { TranscriptSegment } from '@smj/shared';

const useStyles = makeStyles({
  row: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalS,
    paddingInline: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusMedium,
  },
  interim: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: '120px',
    gap: tokens.spacingVerticalXXS,
  },
  time: {
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: 'tabular-nums',
  },
  speaker: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
  },
  text: {
    flex: 1,
    lineHeight: tokens.lineHeightBase400,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  editRow: { display: 'flex', gap: tokens.spacingHorizontalXS, alignItems: 'center' },
});

function formatClock(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

interface SegmentRowProps {
  segment: TranscriptSegment;
  interim?: boolean;
  onRelabel: (speakerId: string, label: string) => void;
}

/** A single utterance line: timestamp, speaker (editable) and Arabic text. */
export const SegmentRow = memo(function SegmentRow({
  segment,
  interim,
  onRelabel,
}: SegmentRowProps) {
  const styles = useStyles();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(segment.speakerLabel);

  const commit = () => {
    onRelabel(segment.speakerId, draft);
    setEditing(false);
  };

  return (
    <div className={mergeClasses(styles.row, interim && styles.interim)}>
      <div className={styles.meta}>
        <Caption1 className={styles.time}>{formatClock(segment.timestamp)}</Caption1>
        {editing ? (
          <div className={styles.editRow}>
            <Input
              size="small"
              value={draft}
              onChange={(_e, data) => setDraft(data.value)}
              onKeyDown={(e) => e.key === 'Enter' && commit()}
              aria-label="اسم المتحدث"
              autoFocus
            />
            <Button size="small" appearance="primary" onClick={commit}>
              حفظ
            </Button>
          </div>
        ) : (
          <span className={styles.speaker}>
            {segment.speakerLabel}
            <Button
              size="small"
              appearance="transparent"
              icon={<EditRegular />}
              aria-label="تعديل اسم المتحدث"
              onClick={() => {
                setDraft(segment.speakerLabel);
                setEditing(true);
              }}
            />
          </span>
        )}
      </div>
      <Text className={styles.text}>{segment.text}</Text>
    </div>
  );
});
