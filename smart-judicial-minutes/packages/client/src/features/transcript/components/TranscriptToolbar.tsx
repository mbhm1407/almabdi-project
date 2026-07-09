import {
  Button,
  Spinner,
  Toolbar,
  ToolbarDivider,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  PauseRegular,
  PlayRegular,
  StopRegular,
  CopyRegular,
  MusicNote2Regular,
} from '@fluentui/react-icons';
import { SearchBar } from './SearchBar';
import { ExportMenu } from './ExportMenu';
import type { TranscriptionStatus } from '../hooks/useTranscription';

const useStyles = makeStyles({
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    paddingInline: tokens.spacingHorizontalL,
    paddingBlock: tokens.spacingVerticalS,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    flexWrap: 'wrap',
  },
  grow: { flex: 1, display: 'flex', alignItems: 'center', minWidth: '220px' },
  saving: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
});

interface TranscriptToolbarProps {
  status: TranscriptionStatus;
  sessionId: string | null;
  isSaving: boolean;
  hasSegments: boolean;
  hasRecording: boolean;
  searchTerm: string;
  matchCount: number;
  activeIndex: number;
  onSearchChange: (value: string) => void;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onCopyAll: () => void;
  onOpenRecordings: () => void;
  onError: (message: string) => void;
}

/** Primary in-hearing controls: pause/resume/stop, search, copy, export, audio. */
export function TranscriptToolbar({
  status,
  sessionId,
  isSaving,
  hasSegments,
  hasRecording,
  searchTerm,
  matchCount,
  activeIndex,
  onSearchChange,
  onNextMatch,
  onPrevMatch,
  onPause,
  onResume,
  onStop,
  onCopyAll,
  onOpenRecordings,
  onError,
}: TranscriptToolbarProps) {
  const styles = useStyles();
  const isActive = status === 'active';
  const isPaused = status === 'paused';
  const isLive = isActive || isPaused;
  const isBusy = status === 'starting' || status === 'stopping';

  return (
    <Toolbar className={styles.bar} aria-label="أدوات النسخ">
      {isLive && (
        <>
          {isActive ? (
            <Button
              appearance="secondary"
              icon={<PauseRegular />}
              onClick={onPause}
              disabled={isBusy}
            >
              إيقاف مؤقت
            </Button>
          ) : (
            <Button
              appearance="primary"
              icon={<PlayRegular />}
              onClick={onResume}
              disabled={isBusy}
            >
              استئناف
            </Button>
          )}
          <Button appearance="secondary" icon={<StopRegular />} onClick={onStop} disabled={isBusy}>
            إيقاف النسخ
          </Button>
          <ToolbarDivider />
        </>
      )}

      <div className={styles.grow}>
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          matchCount={matchCount}
          activeIndex={activeIndex}
          onNext={onNextMatch}
          onPrev={onPrevMatch}
        />
      </div>

      {isSaving && (
        <span className={styles.saving}>
          <Spinner size="tiny" />
          جارٍ الحفظ…
        </span>
      )}

      <Tooltip content="نسخ كامل النص" relationship="label">
        <Button
          appearance="subtle"
          icon={<CopyRegular />}
          aria-label="نسخ كامل النص"
          disabled={!hasSegments}
          onClick={onCopyAll}
        />
      </Tooltip>

      {hasRecording && (
        <Tooltip content="التسجيل الصوتي" relationship="label">
          <Button
            appearance="subtle"
            icon={<MusicNote2Regular />}
            aria-label="التسجيل الصوتي"
            onClick={onOpenRecordings}
          />
        </Tooltip>
      )}

      <ExportMenu sessionId={sessionId} disabled={isBusy || !hasSegments} onError={onError} />
    </Toolbar>
  );
}
