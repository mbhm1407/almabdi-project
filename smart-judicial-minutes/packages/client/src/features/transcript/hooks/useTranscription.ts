import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { apiClient, ApiClientError } from '../../../services/apiClient';
import { AudioRecorder } from '../../../services/audioRecorder';
import { SpeechTranscriber, type RecognizedSegment } from '../../../services/speechTranscriber';
import { transcriptBackup } from '../../../services/transcriptBackup';
import type {
  Bookmark,
  CreateSegmentInput,
  JudicialRole,
  TranscriptionSession,
  TranscriptSegment,
} from '@smj/shared';
import type { TeamsMeetingContext } from '../../../teams/teamsClient';
import type { SessionSetup } from '../types';

export type TranscriptionStatus = 'idle' | 'starting' | 'active' | 'paused' | 'stopping' | 'error';

/** A distinct diarized speaker and its current assignment. */
export interface SpeakerAssignment {
  speakerId: string;
  label: string;
  role: JudicialRole;
}

/** Metrics about the saved audio recording, shown in the recordings panel. */
export interface RecordingInfo {
  bytes: number;
  durationMs: number;
  mimeType: string;
}

export interface UseTranscription {
  status: TranscriptionStatus;
  session: TranscriptionSession | null;
  segments: TranscriptSegment[];
  speakers: SpeakerAssignment[];
  currentSpeaker: SpeakerAssignment | null;
  elapsedMs: number;
  recording: RecordingInfo | null;
  bookmarks: Bookmark[];
  /** true while the Speech connection is being automatically re-established. */
  isReconnecting: boolean;
  error: unknown | null;
  isSaving: boolean;
  start: (setup: SessionSetup) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;
  assignSpeaker: (speakerId: string, label: string, role: JudicialRole) => void;
  addBookmark: (label: string) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  clearError: () => void;
}

const FLUSH_INTERVAL_MS = 4000;

/**
 * Orchestrates a live transcription session end to end:
 *  1. opens a backend session (with case number),
 *  2. starts Azure Speech conversation transcription + audio recording,
 *  3. streams recognized segments into local state (live), resolving each
 *     diarized speaker to its assigned name + judicial role, and
 *  4. periodically persists finalized segments to the API.
 *
 * Supports pause/resume, tracks the current speaker and elapsed time, and on
 * stop flushes remaining segments, uploads the recording and closes the session.
 */
export function useTranscription(context: TeamsMeetingContext): UseTranscription {
  const [status, setStatus] = useState<TranscriptionStatus>('idle');
  const [session, setSession] = useState<TranscriptionSession | null>(null);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [speakers, setSpeakers] = useState<SpeakerAssignment[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<SpeakerAssignment | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recording, setRecording] = useState<RecordingInfo | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const transcriberRef = useRef<SpeechTranscriber | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const sessionRef = useRef<TranscriptionSession | null>(null);
  /** Finalized segments awaiting persistence, keyed by id. */
  const pendingRef = useRef<Map<string, CreateSegmentInput>>(new Map());
  /** Assignment (label + role) per diarized speaker id. */
  const assignmentsRef = useRef<Map<string, { label: string; role: JudicialRole }>>(new Map());
  /** Insertion order index per speaker id, for default naming. */
  const speakerIndexRef = useRef<Map<string, number>>(new Map());
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Mirrors elapsedMs so callbacks can read it without a state dependency. */
  const elapsedRef = useRef(0);

  const resolveAssignment = useCallback(
    (speakerId: string): { label: string; role: JudicialRole } => {
      const existing = assignmentsRef.current.get(speakerId);
      if (existing) return existing;
      let index = speakerIndexRef.current.get(speakerId);
      if (index == null) {
        index = speakerIndexRef.current.size + 1;
        speakerIndexRef.current.set(speakerId, index);
        const created = { label: `متحدث ${index}`, role: 'unassigned' as JudicialRole };
        assignmentsRef.current.set(speakerId, created);
        setSpeakers((prev) => [...prev, { speakerId, ...created }]);
        return created;
      }
      const created = { label: `متحدث ${index}`, role: 'unassigned' as JudicialRole };
      assignmentsRef.current.set(speakerId, created);
      return created;
    },
    [],
  );

  const upsertSegment = useCallback(
    (incoming: RecognizedSegment) => {
      const assignment = resolveAssignment(incoming.speakerId);
      const next: TranscriptSegment = {
        ...incoming,
        speakerLabel: assignment.label,
        speakerRole: assignment.role,
        sessionId: sessionRef.current?.id ?? '',
      };

      setCurrentSpeaker({ speakerId: incoming.speakerId, ...assignment });
      setSegments((prev) => {
        const index = prev.findIndex((s) => s.id === incoming.id);
        if (index === -1) return [...prev, next];
        const copy = prev.slice();
        copy[index] = next;
        return copy;
      });

      if (incoming.isFinal) {
        pendingRef.current.set(incoming.id, {
          id: incoming.id,
          speakerId: incoming.speakerId,
          speakerLabel: assignment.label,
          speakerRole: assignment.role,
          text: incoming.text,
          timestamp: incoming.timestamp,
          offsetMs: incoming.offsetMs,
          durationMs: incoming.durationMs,
          isFinal: true,
        });
        // Mirror unsaved finals to local storage so a crash/reload loses nothing.
        const current = sessionRef.current;
        if (current) transcriptBackup.save(current.id, [...pendingRef.current.values()]);
      }
    },
    [resolveAssignment],
  );

  const flush = useCallback(async () => {
    const current = sessionRef.current;
    if (!current || pendingRef.current.size === 0) return;
    const batch = [...pendingRef.current.values()];
    pendingRef.current.clear();
    try {
      setIsSaving(true);
      await apiClient.saveSegments(current.id, batch);
      // Saved server-side; refresh the local backup to whatever is still pending.
      transcriptBackup.save(current.id, [...pendingRef.current.values()]);
    } catch (err) {
      for (const s of batch) pendingRef.current.set(s.id, s);
      transcriptBackup.save(current.id, [...pendingRef.current.values()]);
      setError(err instanceof ApiClientError ? err : new Error('تعذّر حفظ النص'));
    } finally {
      setIsSaving(false);
    }
  }, []);

  const stopClock = useCallback(() => {
    if (clockTimerRef.current) {
      clearInterval(clockTimerRef.current);
      clockTimerRef.current = null;
    }
  }, []);

  const startClock = useCallback(() => {
    stopClock();
    clockTimerRef.current = setInterval(() => {
      setElapsedMs((ms) => {
        const next = ms + 1000;
        elapsedRef.current = next;
        return next;
      });
    }, 1000);
  }, [stopClock]);

  const teardown = useCallback(async () => {
    if (flushTimerRef.current) {
      clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    stopClock();
    await transcriberRef.current?.stop().catch(() => undefined);
    transcriberRef.current = null;
  }, [stopClock]);

  const start = useCallback(
    async (setup: SessionSetup) => {
      if (status === 'active' || status === 'starting' || status === 'paused') return;
      setError(null);
      setStatus('starting');

      // Seed assignments from the roster the clerk prepared. The first roster
      // entry per role is offered as the default; live diarized speakers are
      // mapped to these during the hearing.
      assignmentsRef.current.clear();
      speakerIndexRef.current.clear();
      setSpeakers([]);
      setCurrentSpeaker(null);
      setElapsedMs(0);
      elapsedRef.current = 0;
      setRecording(null);
      setBookmarks([]);
      setIsReconnecting(false);

      try {
        const { session: created } = await apiClient.startSession({
          meetingId: context.meetingId,
          meetingTitle: setup.meetingTitle || context.meetingTitle,
          caseNumber: setup.caseNumber || null,
        });
        sessionRef.current = created;
        setSession(created);
        setSegments([]);

        const transcriber = new SpeechTranscriber({
          onSegment: upsertSegment,
          onError: (message) => {
            setIsReconnecting(false);
            setError(new Error(message));
          },
          onStopped: () => {
            /* handled by explicit stop() */
          },
          onReconnecting: () => setIsReconnecting(true),
          onReconnected: () => {
            setIsReconnecting(false);
            setError(null);
          },
        });
        transcriberRef.current = transcriber;

        const recorder = new AudioRecorder();
        recorderRef.current = recorder;

        await transcriber.start();
        await recorder.start();

        flushTimerRef.current = setInterval(() => void flush(), FLUSH_INTERVAL_MS);
        startClock();
        setStatus('active');
      } catch (err) {
        setStatus('error');
        setError(err);
        await teardown();
      }
    },
    [status, context, upsertSegment, flush, startClock, teardown],
  );

  const pause = useCallback(() => {
    if (status !== 'active') return;
    transcriberRef.current?.pause();
    recorderRef.current?.pause();
    stopClock();
    setStatus('paused');
  }, [status, stopClock]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    transcriberRef.current?.resume();
    recorderRef.current?.resume();
    startClock();
    setStatus('active');
  }, [status, startClock]);

  const stop = useCallback(async () => {
    if (status !== 'active' && status !== 'paused') return;
    setStatus('stopping');
    setIsReconnecting(false);
    try {
      await teardown();
      await flush();

      const current = sessionRef.current;
      const capturedDurationMs = elapsedRef.current;
      const audio = (await recorderRef.current?.stop()) ?? null;
      recorderRef.current = null;
      if (current && audio && audio.size > 0) {
        setRecording({
          bytes: audio.size,
          durationMs: capturedDurationMs,
          mimeType: audio.type || 'audio/webm',
        });
        try {
          await apiClient.saveRecording(current.id, audio);
        } catch (err) {
          setError(err instanceof ApiClientError ? err : new Error('تعذر حفظ التسجيل الصوتي'));
        }
      }
      if (current) {
        const { session: stopped } = await apiClient.stopSession(current.id);
        sessionRef.current = stopped;
        setSession(stopped);
        // Everything is persisted server-side now; drop the local safety copy.
        if (pendingRef.current.size === 0) transcriptBackup.clear(current.id);
      }
      setCurrentSpeaker(null);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setError(err);
    }
  }, [status, teardown, flush]);

  const assignSpeaker = useCallback((speakerId: string, label: string, role: JudicialRole) => {
    const trimmed = label.trim();
    const resolvedLabel = trimmed || assignmentsRef.current.get(speakerId)?.label || speakerId;
    const assignment = { label: resolvedLabel, role };
    assignmentsRef.current.set(speakerId, assignment);

    setSpeakers((prev) => {
      const index = prev.findIndex((s) => s.speakerId === speakerId);
      const entry: SpeakerAssignment = { speakerId, ...assignment };
      if (index === -1) return [...prev, entry];
      const copy = prev.slice();
      copy[index] = entry;
      return copy;
    });
    setSegments((prev) =>
      prev.map((s) =>
        s.speakerId === speakerId ? { ...s, speakerLabel: resolvedLabel, speakerRole: role } : s,
      ),
    );
    setCurrentSpeaker((prev) =>
      prev?.speakerId === speakerId ? { speakerId, ...assignment } : prev,
    );
    for (const [id, seg] of pendingRef.current) {
      if (seg.speakerId === speakerId) {
        pendingRef.current.set(id, { ...seg, speakerLabel: resolvedLabel, speakerRole: role });
      }
    }
  }, []);

  const addBookmark = useCallback(async (label: string) => {
    const current = sessionRef.current;
    const trimmed = label.trim();
    if (!current || !trimmed) return;
    const bookmark: Bookmark = {
      id: uuid(),
      sessionId: current.id,
      label: trimmed,
      offsetMs: elapsedRef.current,
      timestamp: new Date().toISOString(),
    };
    // Optimistic: show immediately (never lose the clerk's mark), then persist.
    setBookmarks((prev) => [...prev, bookmark].sort((a, b) => a.offsetMs - b.offsetMs));
    try {
      await apiClient.addBookmark(current.id, {
        id: bookmark.id,
        label: bookmark.label,
        offsetMs: bookmark.offsetMs,
        timestamp: bookmark.timestamp,
      });
    } catch (err) {
      setError(err instanceof ApiClientError ? err : new Error('تعذّر حفظ العلامة'));
    }
  }, []);

  const removeBookmark = useCallback(async (id: string) => {
    const current = sessionRef.current;
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    if (current) {
      try {
        await apiClient.deleteBookmark(current.id, id);
      } catch {
        /* removal already reflected locally */
      }
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    return () => {
      void teardown();
      void recorderRef.current?.stop();
    };
  }, [teardown]);

  return {
    status,
    session,
    segments,
    speakers,
    currentSpeaker,
    elapsedMs,
    recording,
    bookmarks,
    isReconnecting,
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
  };
}
