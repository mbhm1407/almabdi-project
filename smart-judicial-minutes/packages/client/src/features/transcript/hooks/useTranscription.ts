import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient, ApiClientError } from '../../../services/apiClient';
import { AudioRecorder } from '../../../services/audioRecorder';
import { SpeechTranscriber, type RecognizedSegment } from '../../../services/speechTranscriber';
import type { CreateSegmentInput, TranscriptionSession, TranscriptSegment } from '@smj/shared';
import type { TeamsMeetingContext } from '../../../teams/teamsClient';

export type TranscriptionStatus = 'idle' | 'starting' | 'active' | 'stopping' | 'error';

export interface UseTranscription {
  status: TranscriptionStatus;
  session: TranscriptionSession | null;
  segments: TranscriptSegment[];
  error: string | null;
  isSaving: boolean;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  relabelSpeaker: (speakerId: string, label: string) => void;
  clearError: () => void;
}

const FLUSH_INTERVAL_MS = 4000;

/**
 * Orchestrates a live transcription session end to end:
 *  1. opens a backend session,
 *  2. starts Azure Speech conversation transcription + audio recording,
 *  3. streams recognized segments into local state (live), and
 *  4. periodically persists finalized segments to the API.
 *
 * On stop it flushes the remaining segments, uploads the audio recording, and
 * closes the session.
 */
export function useTranscription(context: TeamsMeetingContext): UseTranscription {
  const [status, setStatus] = useState<TranscriptionStatus>('idle');
  const [session, setSession] = useState<TranscriptionSession | null>(null);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const transcriberRef = useRef<SpeechTranscriber | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const sessionRef = useRef<TranscriptionSession | null>(null);
  /** Finalized segments awaiting persistence, keyed by id. */
  const pendingRef = useRef<Map<string, CreateSegmentInput>>(new Map());
  /** Clerk-assigned speaker labels, applied to every row for that speaker. */
  const labelsRef = useRef<Map<string, string>>(new Map());
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const applyLabel = useCallback((speakerId: string, fallback: string): string => {
    return labelsRef.current.get(speakerId) ?? fallback;
  }, []);

  const upsertSegment = useCallback(
    (incoming: RecognizedSegment) => {
      setSegments((prev) => {
        const label = applyLabel(incoming.speakerId, incoming.speakerLabel);
        const next: TranscriptSegment = {
          ...incoming,
          speakerLabel: label,
          sessionId: sessionRef.current?.id ?? '',
        };
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
          speakerLabel: applyLabel(incoming.speakerId, incoming.speakerLabel),
          text: incoming.text,
          timestamp: incoming.timestamp,
          offsetMs: incoming.offsetMs,
          durationMs: incoming.durationMs,
          isFinal: true,
        });
      }
    },
    [applyLabel],
  );

  const flush = useCallback(async () => {
    const current = sessionRef.current;
    if (!current || pendingRef.current.size === 0) return;
    const batch = [...pendingRef.current.values()];
    pendingRef.current.clear();
    try {
      setIsSaving(true);
      await apiClient.saveSegments(current.id, batch);
    } catch (err) {
      // Re-queue on failure so nothing is lost.
      for (const s of batch) pendingRef.current.set(s.id, s);
      setError(err instanceof ApiClientError ? err.message : 'تعذر حفظ النص');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const start = useCallback(async () => {
    if (status === 'active' || status === 'starting') return;
    setError(null);
    setStatus('starting');
    try {
      const { session: created } = await apiClient.startSession({
        meetingId: context.meetingId,
        meetingTitle: context.meetingTitle,
      });
      sessionRef.current = created;
      setSession(created);
      setSegments([]);

      const transcriber = new SpeechTranscriber({
        onSegment: upsertSegment,
        onError: (message) => setError(message),
        onStopped: () => {
          /* handled by explicit stop() */
        },
      });
      transcriberRef.current = transcriber;

      const recorder = new AudioRecorder();
      recorderRef.current = recorder;

      await transcriber.start();
      await recorder.start();

      flushTimerRef.current = setInterval(() => void flush(), FLUSH_INTERVAL_MS);
      setStatus('active');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'تعذر بدء النسخ المباشر');
      await teardown();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, context, upsertSegment, flush]);

  const teardown = useCallback(async () => {
    if (flushTimerRef.current) {
      clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    await transcriberRef.current?.stop().catch(() => undefined);
    transcriberRef.current = null;
  }, []);

  const stop = useCallback(async () => {
    if (status !== 'active') return;
    setStatus('stopping');
    try {
      await teardown();
      await flush();

      // Save the audio recording, then close the session.
      const current = sessionRef.current;
      const audio = (await recorderRef.current?.stop()) ?? null;
      recorderRef.current = null;
      if (current && audio && audio.size > 0) {
        try {
          await apiClient.saveRecording(current.id, audio);
        } catch (err) {
          setError(err instanceof ApiClientError ? err.message : 'تعذر حفظ التسجيل الصوتي');
        }
      }
      if (current) {
        const { session: stopped } = await apiClient.stopSession(current.id);
        sessionRef.current = stopped;
        setSession(stopped);
      }
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'تعذر إيقاف النسخ');
    }
  }, [status, teardown, flush]);

  const relabelSpeaker = useCallback((speakerId: string, label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    labelsRef.current.set(speakerId, trimmed);
    setSegments((prev) =>
      prev.map((s) => (s.speakerId === speakerId ? { ...s, speakerLabel: trimmed } : s)),
    );
    // Persist the relabeled finals on the next flush.
    for (const [id, seg] of pendingRef.current) {
      if (seg.speakerId === speakerId) {
        pendingRef.current.set(id, { ...seg, speakerLabel: trimmed });
      }
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Clean up on unmount so leaving the tab mid-hearing releases the mic.
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
    error,
    isSaving,
    start,
    stop,
    relabelSpeaker,
    clearError,
  };
}
