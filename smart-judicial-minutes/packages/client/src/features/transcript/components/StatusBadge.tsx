import { Badge, makeStyles, tokens } from '@fluentui/react-components';
import { RecordRegular, RecordStopRegular } from '@fluentui/react-icons';
import type { TranscriptionStatus } from '../hooks/useTranscription';

const useStyles = makeStyles({
  pulse: {
    animationName: {
      '0%': { opacity: 1 },
      '50%': { opacity: 0.35 },
      '100%': { opacity: 1 },
    },
    animationDuration: '1.4s',
    animationIterationCount: 'infinite',
  },
  dot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginInlineEnd: tokens.spacingHorizontalXS,
    backgroundColor: tokens.colorPaletteRedForeground1,
  },
});

const LABELS: Record<TranscriptionStatus, string> = {
  idle: 'متوقف',
  starting: 'جارٍ البدء…',
  active: 'يسجّل الآن',
  stopping: 'جارٍ الإيقاف…',
  error: 'خطأ',
};

/** Compact indicator of the current recording/transcription state. */
export function StatusBadge({ status }: { status: TranscriptionStatus }) {
  const styles = useStyles();
  const isActive = status === 'active';
  const appearance = isActive ? 'filled' : 'tint';
  const color = status === 'error' ? 'danger' : isActive ? 'danger' : 'informative';

  return (
    <Badge
      appearance={appearance}
      color={color}
      size="large"
      className={isActive ? styles.pulse : undefined}
      icon={isActive ? <RecordRegular /> : <RecordStopRegular />}
      aria-live="polite"
    >
      {LABELS[status]}
    </Badge>
  );
}
