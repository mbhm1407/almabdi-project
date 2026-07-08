import {
  Button,
  Spinner,
  Toolbar,
  ToolbarDivider,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { PlayRegular, StopRegular } from '@fluentui/react-icons';
import { SearchBar } from './SearchBar';
import { ExportMenu } from './ExportMenu';
import type { TranscriptionStatus } from '../hooks/useTranscription';

const useStyles = makeStyles({
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    paddingInline: tokens.spacingHorizontalL,
    paddingBlock: tokens.spacingVerticalS,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    flexWrap: 'wrap',
  },
  grow: { flex: 1, display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS },
  saving: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS },
});

interface TranscriptToolbarProps {
  status: TranscriptionStatus;
  sessionId: string | null;
  isSaving: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onStart: () => void;
  onStop: () => void;
  onError: (message: string) => void;
}

/** Primary controls: start/stop, live search, save indicator and export. */
export function TranscriptToolbar({
  status,
  sessionId,
  isSaving,
  searchTerm,
  onSearchChange,
  onStart,
  onStop,
  onError,
}: TranscriptToolbarProps) {
  const styles = useStyles();
  const isActive = status === 'active';
  const isBusy = status === 'starting' || status === 'stopping';

  return (
    <Toolbar className={styles.bar} aria-label="أدوات النسخ">
      <Button
        appearance="primary"
        icon={<PlayRegular />}
        onClick={onStart}
        disabled={isActive || isBusy}
      >
        بدء النسخ المباشر
      </Button>
      <Button
        appearance="secondary"
        icon={<StopRegular />}
        onClick={onStop}
        disabled={!isActive || isBusy}
      >
        إيقاف النسخ
      </Button>

      <ToolbarDivider />

      <div className={styles.grow}>
        <SearchBar value={searchTerm} onChange={onSearchChange} />
      </div>

      {isSaving && (
        <span className={styles.saving}>
          <Spinner size="tiny" />
          جارٍ الحفظ…
        </span>
      )}

      <ExportMenu sessionId={sessionId} disabled={isBusy} onError={onError} />
    </Toolbar>
  );
}
