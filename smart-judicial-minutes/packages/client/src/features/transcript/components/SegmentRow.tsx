import { memo, useState } from 'react';
import {
  Button,
  Caption1,
  Tooltip,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import { CopyRegular, CheckmarkRegular } from '@fluentui/react-icons';
import { judicialRoleLabel, type JudicialRole, type TranscriptSegment } from '@smj/shared';
import { AR } from '../../../strings';
import { formatClock } from '../../../services/format';
import { highlightChunks } from '../search';
import { SpeakerAssignPopover } from './SpeakerAssignPopover';
import type { Participant } from '../types';

const useStyles = makeStyles({
  block: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    paddingBlock: tokens.spacingVerticalL,
    paddingInline: tokens.spacingHorizontalL,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  activeMatch: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
    borderInlineStartWidth: tokens.strokeWidthThick,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: tokens.colorBrandStroke1,
  },
  interim: { opacity: 0.6 },
  head: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS },
  speaker: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
  },
  role: { color: tokens.colorNeutralForeground2, fontWeight: tokens.fontWeightRegular },
  spacer: { flex: 1 },
  time: { color: tokens.colorNeutralForeground3, fontVariantNumeric: 'tabular-nums' },
  text: {
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase600,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    color: tokens.colorNeutralForeground1,
    marginBlockStart: tokens.spacingVerticalXXS,
  },
  mark: {
    backgroundColor: tokens.colorPaletteYellowBackground2,
    color: tokens.colorNeutralForeground1,
    borderRadius: tokens.borderRadiusSmall,
    paddingInline: '1px',
  },
});

interface SegmentRowProps {
  segment: TranscriptSegment;
  participants: Participant[];
  searchTerm: string;
  isActiveMatch: boolean;
  onAssign: (speakerId: string, label: string, role: JudicialRole) => void;
}

/** Courtroom speech block: speaker + role, timestamp, then large Arabic text. */
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
        styles.block,
        !segment.isFinal && styles.interim,
        isActiveMatch && styles.activeMatch,
      )}
    >
      <div className={styles.head}>
        <span className={styles.speaker}>
          {segment.speakerLabel}
          {hasRole && (
            <span className={styles.role}> · {judicialRoleLabel(segment.speakerRole)}</span>
          )}
        </span>
        <SpeakerAssignPopover
          currentLabel={segment.speakerLabel}
          currentRole={segment.speakerRole}
          participants={participants}
          onAssign={(label, role) => onAssign(segment.speakerId, label, role)}
        />
        <span className={styles.spacer} />
        <Caption1 className={styles.time}>{formatClock(segment.timestamp)}</Caption1>
        <Tooltip content={copied ? 'تم النسخ' : AR.copyLine} relationship="label">
          <Button
            size="small"
            appearance="transparent"
            icon={copied ? <CheckmarkRegular /> : <CopyRegular />}
            aria-label={AR.copyLine}
            onClick={() => void copyLine()}
          />
        </Tooltip>
      </div>

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
    </div>
  );
});
