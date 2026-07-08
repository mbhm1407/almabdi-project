import { Body1, Subtitle1, Switch, Title3, makeStyles, tokens } from '@fluentui/react-components';
import { WeatherMoonRegular, WeatherSunnyRegular } from '@fluentui/react-icons';
import type { TeamsMeetingContext } from '../../../teams/teamsClient';
import type { ThemeMode } from '../../../theme/themes';
import { StatusBadge } from './StatusBadge';
import type { TranscriptionStatus } from '../hooks/useTranscription';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    paddingInline: tokens.spacingHorizontalL,
    paddingBlock: tokens.spacingVerticalM,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    flexWrap: 'wrap',
  },
  info: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXXS, minWidth: 0 },
  meetingTitle: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '48ch',
  },
  right: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalM },
  themeToggle: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS },
});

interface MeetingHeaderProps {
  context: TeamsMeetingContext;
  status: TranscriptionStatus;
  themeMode: ThemeMode;
  onToggleDark: () => void;
}

/** App header: meeting information, live status, and the dark-mode toggle. */
export function MeetingHeader({ context, status, themeMode, onToggleDark }: MeetingHeaderProps) {
  const styles = useStyles();
  return (
    <header className={styles.header}>
      <div className={styles.info}>
        <Title3>المحضر الذكي</Title3>
        <Subtitle1 className={styles.meetingTitle}>{context.meetingTitle}</Subtitle1>
        <Body1>الكاتب: {context.userName}</Body1>
      </div>
      <div className={styles.right}>
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
