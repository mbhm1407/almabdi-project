import {
  Badge,
  Body1,
  Caption1,
  Subtitle2,
  Switch,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  WeatherMoonRegular,
  WeatherSunnyRegular,
  PersonVoiceRegular,
  TimerRegular,
} from '@fluentui/react-icons';
import { formatDuration, judicialRoleLabel } from '@smj/shared';
import { AR } from '../../../strings';
import type { ThemeMode } from '../../../theme/themes';
import { StatusBadge } from './StatusBadge';
import type { SpeakerAssignment, TranscriptionStatus } from '../hooks/useTranscription';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    paddingInline: tokens.spacingHorizontalL,
    paddingBlock: tokens.spacingVerticalM,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorBrandBackground2,
    flexWrap: 'wrap',
  },
  left: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalM, minWidth: 0 },
  emblem: { fontSize: '28px', lineHeight: 1, flexShrink: 0 },
  info: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  brandRow: { display: 'flex', alignItems: 'baseline', gap: tokens.spacingHorizontalS },
  ministry: { color: tokens.colorNeutralForeground2 },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
  },
  metric: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground2,
    fontVariantNumeric: 'tabular-nums',
  },
  speaker: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    maxWidth: '26ch',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    fontWeight: tokens.fontWeightSemibold,
  },
  themeToggle: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS },
});

interface MeetingHeaderProps {
  caseNumber: string | null;
  circuitName: string | null;
  status: TranscriptionStatus;
  elapsedMs: number;
  currentSpeaker: SpeakerAssignment | null;
  themeMode: ThemeMode;
  onToggleDark: () => void;
}

function speakerText(speaker: SpeakerAssignment): string {
  if (speaker.role && speaker.role !== 'unassigned') {
    return `${judicialRoleLabel(speaker.role)} — ${speaker.label}`;
  }
  return speaker.label;
}

/** Official courtroom header: ministry identity, hearing meta, live state. */
export function MeetingHeader({
  caseNumber,
  circuitName,
  status,
  elapsedMs,
  currentSpeaker,
  themeMode,
  onToggleDark,
}: MeetingHeaderProps) {
  const styles = useStyles();
  const isLive = status === 'active' || status === 'paused';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.emblem} role="img" aria-label="ميزان العدل">
          ⚖️
        </span>
        <div className={styles.info}>
          <div className={styles.brandRow}>
            <Subtitle2>{AR.appName}</Subtitle2>
            <Caption1 className={styles.ministry}>{AR.ministry}</Caption1>
          </div>
          <div className={styles.metaRow}>
            {caseNumber && (
              <Badge appearance="tint" color="brand" size="small">
                {AR.caseNumber}: {caseNumber}
              </Badge>
            )}
            {circuitName && (
              <Badge appearance="outline" color="brand" size="small">
                {AR.circuit}: {circuitName}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className={styles.right}>
        {isLive && currentSpeaker && (
          <Tooltip content={AR.currentSpeaker} relationship="label">
            <Body1 className={styles.speaker}>
              <PersonVoiceRegular />
              {speakerText(currentSpeaker)}
            </Body1>
          </Tooltip>
        )}
        {isLive && (
          <span className={styles.metric} aria-label={AR.sessionDuration}>
            <TimerRegular />
            {formatDuration(elapsedMs)}
          </span>
        )}
        <StatusBadge status={status} />
        <Tooltip content={AR.darkMode} relationship="label">
          <div className={styles.themeToggle}>
            {themeMode === 'dark' ? <WeatherMoonRegular /> : <WeatherSunnyRegular />}
            <Switch
              checked={themeMode === 'dark'}
              onChange={onToggleDark}
              aria-label={AR.darkMode}
            />
          </div>
        </Tooltip>
      </div>
    </header>
  );
}
