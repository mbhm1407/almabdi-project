import { memo, useState } from 'react';
import {
  Badge,
  Button,
  Caption1,
  Tooltip,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import { CopyRegular, CheckmarkRegular } from '@fluentui/react-icons';
import { judicialRoleLabel, type JudicialRole, type TranscriptSegment } from '@smj/shared';
import { formatClock } from '../../../services/format';
import { highlightChunks } from '../search';
import { SpeakerAssignPopover } from './SpeakerAssignPopover';
import type { Participant } from '../types';

const useStyles = makeStyles({
  row: {
    display: 'flex',
    gap: tokens.spacingHorizontalL,
    paddingBlock: tokens.spacingVerticalM,
    paddingInline: tokens.spacingHorizontalL,
    borderRadius: tokens.borderRadiusMedium,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke3}`,
  },
  activeMatch: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
    outline: `${tokens.strokeWidthThick} solid ${tokens.colorBrandStroke1}`,
    outlineOffset: '-2px',
  },
  interim: { opacity: 0.65 },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens.spacingVerticalXXS,
    minWidth: '140px',
    maxWidth: '160px',
  },
  time: { color: tokens.colorNeutralForeground3, fontVariantNumeric: 'tabular-nums' },
  speakerLine: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXXS },
  speakerName: { fontWeight: tokens.fontWeightSemibold, color: tokens.colorNeutralForeground1 },
  body: { flex: 1, display: 'flex', alignItems: 'flex-start', gap: tokens.spacingHorizontalS },
  text: {
    flex: 1,
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase500,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    color: tokens.colorNeutralForeground1,
  },
  mark: {
    backgroundColor: tokens.colorPaletteYellowBackground2,
    color: tokens.colorNeutralForeground1,
    borderRadius: tokens.borderRadiusSmall,
    paddingInline: '1px',
  },
  copyBtn: { flexShrink: 0 },
});

interface SegmentRowProps {
  segment: TranscriptSegment;
  participants: Participant[];
  searchTerm: string;
  isActiveMatch: boolean;
  onAssign: (speakerId: string, label: string, role: JudicialRole) => void;
}

/** A single utterance: timestamp, speaker name + judicial role, Arabic text. */
export const SegmentRow = memo(function SegmentRow({
  segment,
  participants,
  searchTerm,
  isActiveMatch,
  onAssign,
}: SegmentRowProps) {
  const styles = useStyles();
  const [copied, setCopied] = useState(false);
  const hasRole = segment.speakerRole && segment.speakerRole !== 'unassigned';

  const copyLine = async () => {
    const line = `[${formatClock(segment.timestamp)}] ${segment.speakerLabel}${
      hasRole ? ` (${judicialRoleLabel(segment.speakerRole)})` : ''
    }: ${segment.text}`;
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      className={mergeClasses(
        styles.row,
        !segment.isFinal && styles.interim,
        isActiveMatch && styles.activeMatch,
      )}
    >
      <div className={styles.meta}>
        <Caption1 className={styles.time}>{formatClock(segment.timestamp)}</Caption1>
        <div className={styles.speakerLine}>
          <span className={styles.speakerName}>{segment.speakerLabel}</span>
          <SpeakerAssignPopover
            currentLabel={segment.speakerLabel}
            currentRole={segment.speakerRole}
            participants={participants}
            onAssign={(label, role) => onAssign(segment.speakerId, label, role)}
          />
        </div>
        {hasRole && (
          <Badge appearance="tint" color="brand" size="small">
            {judicialRoleLabel(segment.speakerRole)}
          </Badge>
        )}
      </div>

      <div className={styles.body}>
        <span className={styles.text}>
          {highlightChunks(segment.text, searchTerm).map((chunk, i) =>
            chunk.match ? (
              <mark key={i} className={styles.mark}>
                {chunk.text}
              </mark>
            ) : (
              <span key={i}>{chunk.text}</span>
            ),
          )}
        </span>
        <Tooltip content={copied ? 'تم النسخ' : 'نسخ السطر'} relationship="label">
          <Button
            className={styles.copyBtn}
            size="small"
            appearance="transparent"
            icon={copied ? <CheckmarkRegular /> : <CopyRegular />}
            aria-label="نسخ السطر"
            onClick={() => void copyLine()}
          />
        </Tooltip>
      </div>
    </div>
  );
});
