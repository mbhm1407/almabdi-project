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
  GavelRegular,
  PersonVoiceRegular,
  TimerRegular,
} from '@fluentui/react-icons';
import { formatDuration, judicialRoleLabel } from '@smj/shared';
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
    backgroundColor: tokens.colorNeutralBackground1,
    flexWrap: 'wrap',
  },
  left: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalM, minWidth: 0 },
  brandIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground2,
    flexShrink: 0,
  },
  info: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  title: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '44ch',
  },
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
    maxWidth: '28ch',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  themeToggle: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS },
});

interface MeetingHeaderProps {
  meetingTitle: string;
  caseNumber: string | null;
  clerkName: string;
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

/** App header: hearing identity, live status, current speaker, elapsed time. */
export function MeetingHeader({
  meetingTitle,
  caseNumber,
  clerkName,
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
        <span className={styles.brandIcon} aria-hidden>
          <GavelRegular fontSize={22} />
        </span>
        <div className={styles.info}>
          <Subtitle2 className={styles.title}>{meetingTitle}</Subtitle2>
          <div className={styles.metaRow}>
            {caseNumber && (
              <Badge appearance="tint" color="brand" size="small">
                رقم القضية: {caseNumber}
              </Badge>
            )}
            <Caption1>الكاتب: {clerkName}</Caption1>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        {isLive && currentSpeaker && (
          <Tooltip content="المتحدث الحالي" relationship="label">
            <Body1 className={styles.speaker}>
              <PersonVoiceRegular />
              {speakerText(currentSpeaker)}
            </Body1>
          </Tooltip>
        )}
        {isLive && (
          <span className={styles.metric} aria-label="مدة الجلسة">
            <TimerRegular />
            {formatDuration(elapsedMs)}
          </span>
        )}
        <StatusBadge status={status} />
        <div className={styles.themeToggle}>
          {themeMode === 'dark' ? <WeatherMoonRegular /> : <WeatherSunnyRegular />}
          <Switch
            checked={themeMode === 'dark'}
            onChange={onToggleDark}
            aria-label="الوضع الداكن"
          />
        </div>
      </div>
    </header>
  );
}
