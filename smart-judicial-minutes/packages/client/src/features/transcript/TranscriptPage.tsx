import { useCallback, useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@fluentui/react-components';
import { judicialRoleLabel, sessionDurationMs, type Bookmark } from '@smj/shared';
import type { TeamsMeetingContext } from '../../teams/teamsClient';
import type { ThemeMode } from '../../theme/themes';
import { formatClock } from '../../services/format';
import { toFriendlyError } from '../../services/errorMessages';
import { printTranscript } from '../../services/print';
import { useTranscription } from './hooks/useTranscription';
import { MeetingHeader } from './components/MeetingHeader';
import { TranscriptToolbar } from './components/TranscriptToolbar';
import { TranscriptList } from './components/TranscriptList';
import { OpeningScreen } from './components/OpeningScreen';
import { ErrorDialog } from './components/ErrorDialog';
import { RecordingsPanel } from './components/RecordingsPanel';
import { BookmarksPanel } from './components/BookmarksPanel';
import { StatisticsPanel } from './components/StatisticsPanel';
import { cycleIndex, matchingSegmentIds, nearestSegmentIdByOffset } from './search';
import { computeStatistics } from './stats';
import type { Participant, SessionSetup } from './types';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 },
  body: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' },
});

interface TranscriptPageProps {
  context: TeamsMeetingContext;
  themeMode: ThemeMode;
  onToggleDark: () => void;
}

interface Jump {
  segmentId: string | null;
  seekMs: number | null;
  nonce: number;
}

/**
 * The single hearing screen. Before starting it shows the official opening
 * (case number, circuit, judge, clerk); during and after the hearing it shows
 * the distraction-free courtroom transcript with statistics, bookmarks, search,
 * export, print and recordings.
 */
export function TranscriptPage({ context, themeMode, onToggleDark }: TranscriptPageProps) {
  const styles = useStyles();
  const {
    status,
    session,
    segments,
    currentSpeaker,
    elapsedMs,
    recording,
    bookmarks,
    error,
    isSaving,
    start,
    pause,
    resume,
    stop,
    assignSpeaker,
    addBookmark,
    removeBookmark,
    clearError,
  } = useTranscription(context);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [localError, setLocalError] = useState<unknown>(null);
  const [recordingsOpen, setRecordingsOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [jump, setJump] = useState<Jump>({ segmentId: null, seekMs: null, nonce: 0 });
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const matchIds = useMemo(() => matchingSegmentIds(segments, searchTerm), [segments, searchTerm]);
  const stats = useMemo(() => computeStatistics(segments), [segments]);

  useEffect(() => {
    setActiveIndex(0);
  }, [searchTerm]);

  const clampedIndex = matchIds.length ? Math.min(activeIndex, matchIds.length - 1) : -1;
  const activeMatchId = clampedIndex >= 0 ? matchIds[clampedIndex]! : null;

  const nextMatch = useCallback(
    () => setActiveIndex((i) => cycleIndex(i, 1, matchIds.length)),
    [matchIds.length],
  );
  const prevMatch = useCallback(
    () => setActiveIndex((i) => cycleIndex(i, -1, matchIds.length)),
    [matchIds.length],
  );

  const friendlyError = useMemo(() => {
    const err = error ?? localError;
    return err ? toFriendlyError(err) : null;
  }, [error, localError]);

  const dismissError = () => {
    setLocalError(null);
    clearError();
  };

  const handleStart = (setup: SessionSetup) => {
    setParticipants(setup.participants);
    void start(setup);
  };

  const hasRecording = recording !== null || Boolean(session?.recordingBlobName);

  const copyAll = useCallback(() => {
    const text = segments
      .filter((s) => s.isFinal)
      .map((s) => {
        const role =
          s.speakerRole && s.speakerRole !== 'unassigned'
            ? ` (${judicialRoleLabel(s.speakerRole)})`
            : '';
        return `[${formatClock(s.timestamp)}] ${s.speakerLabel}${role}: ${s.text}`;
      })
      .join('\n');
    void navigator.clipboard?.writeText(text).catch(() => undefined);
  }, [segments]);

  const handlePrint = useCallback(() => {
    if (!session) return;
    printTranscript(
      {
        caseNumber: session.caseNumber,
        circuitName: session.circuitName,
        judgeName: session.judgeName,
        date: new Date(session.startedAt).toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        durationMs: sessionDurationMs(session),
      },
      segments,
    );
  }, [session, segments]);

  const handleJump = useCallback(
    (bookmark: Bookmark) => {
      const segmentId = nearestSegmentIdByOffset(segments, bookmark.offsetMs);
      setJump((prev) => ({
        segmentId,
        seekMs: bookmark.offsetMs,
        nonce: prev.nonce + 1,
      }));
      setBookmarksOpen(false);
      if (hasRecording) setRecordingsOpen(true);
    },
    [segments, hasRecording],
  );

  const seekRequest = useMemo(
    () => (jump.seekMs != null ? { ms: jump.seekMs, nonce: jump.nonce } : null),
    [jump.seekMs, jump.nonce],
  );

  return (
    <div className={styles.page}>
      <MeetingHeader
        caseNumber={session?.caseNumber ?? null}
        circuitName={session?.circuitName ?? null}
        status={status}
        elapsedMs={elapsedMs}
        currentSpeaker={currentSpeaker}
        themeMode={themeMode}
        onToggleDark={onToggleDark}
      />

      {!session ? (
        <OpeningScreen
          defaultTitle={context.meetingTitle}
          clerkName={context.userName}
          busy={status === 'starting'}
          onStart={handleStart}
        />
      ) : (
        <>
          <TranscriptToolbar
            status={status}
            sessionId={session.id}
            isSaving={isSaving}
            hasSegments={segments.some((s) => s.isFinal)}
            hasRecording={hasRecording}
            bookmarkCount={bookmarks.length}
            searchTerm={searchTerm}
            matchCount={matchIds.length}
            activeIndex={clampedIndex}
            onSearchChange={setSearchTerm}
            onNextMatch={nextMatch}
            onPrevMatch={prevMatch}
            onPause={pause}
            onResume={resume}
            onStop={() => void stop()}
            onAddBookmark={() => setBookmarksOpen(true)}
            onOpenBookmarks={() => setBookmarksOpen(true)}
            onOpenStatistics={() => setStatsOpen(true)}
            onCopyAll={copyAll}
            onOpenRecordings={() => setRecordingsOpen(true)}
            onPrint={handlePrint}
            onError={setLocalError}
          />
          <div className={styles.body}>
            <TranscriptList
              segments={segments}
              participants={participants}
              searchTerm={searchTerm}
              matchIds={matchIds}
              activeMatchId={activeMatchId}
              autoScroll={status === 'active'}
              focusSegmentId={jump.segmentId}
              focusNonce={jump.nonce}
              onAssign={assignSpeaker}
            />
          </div>
        </>
      )}

      <ErrorDialog error={friendlyError} onDismiss={dismissError} />
      <RecordingsPanel
        open={recordingsOpen}
        sessionId={session?.id ?? null}
        recording={recording}
        seekRequest={seekRequest}
        onClose={() => setRecordingsOpen(false)}
      />
      <BookmarksPanel
        open={bookmarksOpen}
        bookmarks={bookmarks}
        canAdd={status === 'active' || status === 'paused'}
        onClose={() => setBookmarksOpen(false)}
        onAdd={(label) => void addBookmark(label)}
        onRemove={(id) => void removeBookmark(id)}
        onJump={handleJump}
      />
      <StatisticsPanel
        open={statsOpen}
        elapsedMs={elapsedMs}
        stats={stats}
        online={online}
        status={status}
        onClose={() => setStatsOpen(false)}
      />
    </div>
  );
}
