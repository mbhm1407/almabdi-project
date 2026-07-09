import {
  AudioConfig,
  ConversationTranscriber,
  ResultReason,
  SpeechConfig,
  type ConversationTranscriptionEventArgs,
} from 'microsoft-cognitiveservices-speech-sdk';
import { v4 as uuid } from 'uuid';
import { apiClient } from './apiClient';
import type { CreateSegmentInput } from '@smj/shared';

export interface RecognizedSegment extends CreateSegmentInput {
  /** Present while the utterance is still being recognized (interim). */
  interim: boolean;
}

export interface TranscriberCallbacks {
  onSegment: (segment: RecognizedSegment) => void;
  onError: (message: string) => void;
  onStopped: () => void;
}

/**
 * Real-time Arabic conversation transcription backed by Azure AI Speech.
 *
 * Uses {@link ConversationTranscriber} so each utterance carries a diarized
 * speaker id (e.g. "Guest-1") in addition to text, timestamp and duration.
 * The subscription key never reaches the browser — we authenticate with a
 * short-lived token minted by the backend and refresh it before it expires.
 */
export class SpeechTranscriber {
  private transcriber: ConversationTranscriber | null = null;
  private speechConfig: SpeechConfig | null = null;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private sessionStart = 0;
  private paused = false;
  /** Maps interim utterance ids so a final result overwrites its interim row. */
  private readonly activeBySpeaker = new Map<string, string>();

  constructor(private readonly callbacks: TranscriberCallbacks) {}

  /**
   * Pauses transcription. The recognizer keeps its diarization session alive but
   * incoming results are dropped, so nothing is captured while paused.
   */
  pause(): void {
    this.paused = true;
  }

  /** Resumes capturing recognized results after a {@link pause}. */
  resume(): void {
    this.paused = false;
  }

  get isPaused(): boolean {
    return this.paused;
  }

  async start(): Promise<void> {
    const token = await apiClient.getSpeechToken();
    this.speechConfig = SpeechConfig.fromAuthorizationToken(token.token, token.region);
    this.speechConfig.speechRecognitionLanguage = token.locale;

    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    this.transcriber = new ConversationTranscriber(this.speechConfig, audioConfig);
    this.sessionStart = Date.now();

    this.transcriber.transcribing = (_s, e) => this.handleEvent(e, false);
    this.transcriber.transcribed = (_s, e) => this.handleEvent(e, true);
    this.transcriber.canceled = (_s, e) => {
      this.callbacks.onError(e.errorDetails || 'Transcription was canceled');
    };
    this.transcriber.sessionStopped = () => this.callbacks.onStopped();

    await new Promise<void>((resolve, reject) => {
      this.transcriber!.startTranscribingAsync(
        () => resolve(),
        (err) => reject(new Error(err)),
      );
    });

    // Refresh the auth token every ~8 minutes to keep the stream alive.
    this.refreshTimer = setInterval(() => void this.refreshToken(), 8 * 60 * 1000);
  }

  private async refreshToken(): Promise<void> {
    try {
      const token = await apiClient.getSpeechToken();
      if (this.speechConfig) {
        this.speechConfig.authorizationToken = token.token;
      }
    } catch (err) {
      this.callbacks.onError(err instanceof Error ? err.message : 'Failed to refresh speech token');
    }
  }

  private handleEvent(e: ConversationTranscriptionEventArgs, isFinal: boolean): void {
    if (this.paused) return;
    const text = e.result.text?.trim();
    if (!text) return;
    if (isFinal && e.result.reason !== ResultReason.RecognizedSpeech) return;

    const speakerId = e.result.speakerId || 'Speaker';
    // Reuse the interim id for this speaker so the final result replaces it.
    let id = this.activeBySpeaker.get(speakerId);
    if (!id) {
      id = uuid();
      this.activeBySpeaker.set(speakerId, id);
    }
    if (isFinal) {
      this.activeBySpeaker.delete(speakerId);
    }

    const offsetMs = Math.max(0, Math.round(e.result.offset / 10_000)); // ticks (100ns) -> ms
    const durationMs = Math.max(0, Math.round(e.result.duration / 10_000));
    const segment: RecognizedSegment = {
      id,
      speakerId,
      speakerLabel: speakerId,
      // Role is resolved by the transcription hook from the clerk's assignments.
      speakerRole: 'unassigned',
      text,
      timestamp: new Date(this.sessionStart + offsetMs).toISOString(),
      offsetMs,
      durationMs,
      isFinal,
      interim: !isFinal,
    };
    this.callbacks.onSegment(segment);
  }

  async stop(): Promise<void> {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    const transcriber = this.transcriber;
    if (!transcriber) return;
    await new Promise<void>((resolve) => {
      transcriber.stopTranscribingAsync(
        () => resolve(),
        () => resolve(),
      );
    });
    transcriber.close();
    this.transcriber = null;
    this.activeBySpeaker.clear();
  }
}
