import {
  Badge,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { formatDuration } from '@smj/shared';
import { AR } from '../../../strings';
import { formatClock } from '../../../services/format';
import type { HearingStats } from '../stats';
import type { TranscriptionStatus } from '../hooks/useTranscription';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: tokens.spacingHorizontalM,
    minWidth: '320px',
  },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  label: { color: tokens.colorNeutralForeground3 },
  value: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    fontVariantNumeric: 'tabular-nums',
  },
  statusRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
    marginBlockStart: tokens.spacingVerticalM,
  },
});

interface StatisticsPanelProps {
  open: boolean;
  elapsedMs: number;
  stats: HearingStats;
  online: boolean;
  status: TranscriptionStatus;
  onClose: () => void;
}

function speechStatusLabel(status: TranscriptionStatus): {
  text: string;
  color: 'success' | 'warning' | 'danger' | 'informative';
} {
  switch (status) {
    case 'active':
      return { text: AR.connected, color: 'success' };
    case 'paused':
      return { text: AR.statusPaused, color: 'warning' };
    case 'error':
      return { text: AR.statusError, color: 'danger' };
    default:
      return { text: AR.statusIdle, color: 'informative' };
  }
}

/** Professional hearing statistics: duration, speakers, words, phrases, status. */
export function StatisticsPanel({
  open,
  elapsedMs,
  stats,
  online,
  status,
  onClose,
}: StatisticsPanelProps) {
  const styles = useStyles();
  const speech = speechStatusLabel(status);

  const tiles = [
    { label: AR.sessionDuration, value: formatDuration(elapsedMs) },
    { label: AR.speakersCount, value: String(stats.speakers) },
    { label: AR.wordsCount, value: stats.words.toLocaleString('ar-SA') },
    { label: AR.phrasesCount, value: stats.phrases.toLocaleString('ar-SA') },
    { label: AR.lastUpdate, value: stats.lastUpdate ? formatClock(stats.lastUpdate) : '—' },
  ];

  return (
    <Dialog open={open} onOpenChange={(_e, data) => !data.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{AR.statistics}</DialogTitle>
          <DialogContent>
            <div className={styles.grid}>
              {tiles.map((t) => (
                <div key={t.label} className={styles.tile}>
                  <Text className={styles.label} size={200}>
                    {t.label}
                  </Text>
                  <Text className={styles.value}>{t.value}</Text>
                </div>
              ))}
            </div>
            <div className={styles.statusRow}>
              <Badge appearance="tint" color={online ? 'success' : 'danger'} size="large">
                {AR.connection}: {online ? AR.connected : AR.disconnected}
              </Badge>
              <Badge appearance="tint" color={speech.color} size="large">
                {AR.speechService}: {speech.text}
              </Badge>
            </div>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
