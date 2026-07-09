import { Badge, makeStyles } from '@fluentui/react-components';
import { RecordRegular, PauseRegular, CheckmarkRegular } from '@fluentui/react-icons';
import type { TranscriptionStatus } from '../hooks/useTranscription';

const useStyles = makeStyles({
  pulse: {
    animationName: {
      '0%': { opacity: 1 },
      '50%': { opacity: 0.4 },
      '100%': { opacity: 1 },
    },
    animationDuration: '1.4s',
    animationIterationCount: 'infinite',
  },
});

const LABELS: Record<TranscriptionStatus, string> = {
  idle: 'متوقف',
  starting: 'جارٍ البدء…',
  active: 'يسجّل الآن',
  paused: 'إيقاف مؤقت',
  stopping: 'جارٍ الإيقاف…',
  error: 'خطأ',
};

/** Compact, accessible indicator of the current recording/transcription state. */
export function StatusBadge({ status }: { status: TranscriptionStatus }) {
  const styles = useStyles();
  const isActive = status === 'active';

  const color =
    status === 'error'
      ? 'danger'
      : isActive
        ? 'danger'
        : status === 'paused'
          ? 'warning'
          : status === 'idle'
            ? 'success'
            : 'informative';

  const icon = isActive ? (
    <RecordRegular />
  ) : status === 'paused' ? (
    <PauseRegular />
  ) : status === 'idle' ? (
    <CheckmarkRegular />
  ) : (
    <RecordRegular />
  );

  return (
    <Badge
      appearance={isActive ? 'filled' : 'tint'}
      color={color}
      size="large"
      className={isActive ? styles.pulse : undefined}
      icon={icon}
      aria-live="polite"
    >
      {LABELS[status]}
    </Badge>
  );
}
