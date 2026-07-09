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
  BookmarkRegular,
  BookmarkAddRegular,
  DataBarVerticalRegular,
  PrintRegular,
} from '@fluentui/react-icons';
import { AR } from '../../../strings';
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
  grow: { flex: 1, display: 'flex', alignItems: 'center', minWidth: '200px' },
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
  bookmarkCount: number;
  searchTerm: string;
  matchCount: number;
  activeIndex: number;
  onSearchChange: (value: string) => void;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onAddBookmark: () => void;
  onOpenBookmarks: () => void;
  onOpenStatistics: () => void;
  onCopyAll: () => void;
  onOpenRecordings: () => void;
  onPrint: () => void;
  onError: (message: string) => void;
}

/** In-hearing controls: documentation state, bookmarks, search, and outputs. */
export function TranscriptToolbar(props: TranscriptToolbarProps) {
  const styles = useStyles();
  const {
    status,
    sessionId,
    isSaving,
    hasSegments,
    hasRecording,
    bookmarkCount,
    searchTerm,
    matchCount,
    activeIndex,
    onSearchChange,
    onNextMatch,
    onPrevMatch,
    onPause,
    onResume,
    onStop,
    onAddBookmark,
    onOpenBookmarks,
    onOpenStatistics,
    onCopyAll,
    onOpenRecordings,
    onPrint,
    onError,
  } = props;

  const isActive = status === 'active';
  const isPaused = status === 'paused';
  const isLive = isActive || isPaused;
  const isBusy = status === 'starting' || status === 'stopping';

  return (
    <Toolbar className={styles.bar} aria-label="أدوات التوثيق">
      {isLive && (
        <>
          {isActive ? (
            <Button
              appearance="secondary"
              icon={<PauseRegular />}
              onClick={onPause}
              disabled={isBusy}
            >
              {AR.pause}
            </Button>
          ) : (
            <Button
              appearance="primary"
              icon={<PlayRegular />}
              onClick={onResume}
              disabled={isBusy}
            >
              {AR.resume}
            </Button>
          )}
          <Button appearance="secondary" icon={<StopRegular />} onClick={onStop} disabled={isBusy}>
            {AR.stopDocumentation}
          </Button>
          <Button
            appearance="primary"
            icon={<BookmarkAddRegular />}
            onClick={onAddBookmark}
            disabled={isBusy}
          >
            {AR.addBookmark}
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

      <Tooltip content={AR.bookmarks} relationship="label">
        <Button
          appearance="subtle"
          icon={<BookmarkRegular />}
          aria-label={`${AR.bookmarks} (${bookmarkCount})`}
          onClick={onOpenBookmarks}
        />
      </Tooltip>
      <Tooltip content={AR.statistics} relationship="label">
        <Button
          appearance="subtle"
          icon={<DataBarVerticalRegular />}
          aria-label={AR.statistics}
          onClick={onOpenStatistics}
        />
      </Tooltip>
      <Tooltip content={AR.copyAll} relationship="label">
        <Button
          appearance="subtle"
          icon={<CopyRegular />}
          aria-label={AR.copyAll}
          disabled={!hasSegments}
          onClick={onCopyAll}
        />
      </Tooltip>
      <Tooltip content={AR.print} relationship="label">
        <Button
          appearance="subtle"
          icon={<PrintRegular />}
          aria-label={AR.print}
          disabled={!hasSegments}
          onClick={onPrint}
        />
      </Tooltip>
      {hasRecording && (
        <Tooltip content={AR.recording} relationship="label">
          <Button
            appearance="subtle"
            icon={<MusicNote2Regular />}
            aria-label={AR.recording}
            onClick={onOpenRecordings}
          />
        </Tooltip>
      )}

      <ExportMenu sessionId={sessionId} disabled={isBusy || !hasSegments} onError={onError} />
    </Toolbar>
  );
}
