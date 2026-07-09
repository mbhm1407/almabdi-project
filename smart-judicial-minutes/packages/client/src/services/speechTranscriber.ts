import type {
  ConversationTranscriber,
  ConversationTranscriptionEventArgs,
  SpeechConfig,
} from 'microsoft-cognitiveservices-speech-sdk';
import { v4 as uuid } from 'uuid';
import { apiClient } from './apiClient';
import type { CreateSegmentInput } from '@smj/shared';

type SpeechSdk = typeof import('microsoft-cognitiveservices-speech-sdk');

export interface RecognizedSegment extends CreateSegmentInput {
  /** Present while the utterance is still being recognized (interim). */
  interim: boolean;
}

export interface TranscriberCallbacks {
  onSegment: (segment: RecognizedSegment) => void;
  onError: (message: string) => void;
  onStopped: () => void;
  /** Fired when a transient disconnect triggers an automatic reconnect attempt. */
  onReconnecting?: (attempt: number) => void;
  /** Fired once transcription resumes after an automatic reconnect. */
  onReconnected?: () => void;
}

const MAX_RESTART_ATTEMPTS = 5;
const TOKEN_REFRESH_MS = 8 * 60 * 1000;

/**
 * Real-time Arabic conversation transcription backed by Azure AI Speech.
 *
 * The heavy Speech SDK is loaded lazily on first use so it never bloats the
 * initial bundle. Uses {@link ConversationTranscriber} for diarized speaker ids,
 * authenticates with a short-lived backend token (the subscription key never
 * reaches the browser), and automatically reconnects after transient
 * disconnects without losing the session clock.
 */
export class SpeechTranscriber {
  private sdk: SpeechSdk | null = null;
  private transcriber: ConversationTranscriber | null = null;
  private speechConfig: SpeechConfig | null = null;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private sessionStart = 0;
  private paused = false;
  private stopping = false;
  private restarting = false;
  private restartAttempts = 0;
  /** Maps interim utterance ids so a final result overwrites its interim row. */
  private readonly activeBySpeaker = new Map<string, string>();

  constructor(private readonly callbacks: TranscriberCallbacks) {}

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  get isPaused(): boolean {
    return this.paused;
  }

  async start(): Promise<void> {
    this.stopping = false;
    this.restarting = false;
    this.restartAttempts = 0;
    this.sessionStart = Date.now();
    this.sdk = await import('microsoft-cognitiveservices-speech-sdk');
    await this.buildAndStart();
    this.refreshTimer = setInterval(() => void this.refreshToken(), TOKEN_REFRESH_MS);
  }

  /** Builds a transcriber from a fresh token and begins transcribing. */
  private async buildAndStart(): Promise<void> {
    const sdk = this.sdk;
    if (!sdk) throw new Error('Speech SDK not loaded');
    const token = await apiClient.getSpeechToken();
    if (this.stopping) return; // aborted before we opened the microphone

    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token.token, token.region);
    speechConfig.speechRecognitionLanguage = token.locale;
    this.speechConfig = speechConfig;

    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    const transcriber = new sdk.ConversationTranscriber(speechConfig, audioConfig);

    transcriber.transcribing = (_s, e) => this.handleEvent(e, false);
    transcriber.transcribed = (_s, e) => {
      this.restartAttempts = 0; // healthy stream resets the reconnect budget
      this.handleEvent(e, true);
    };
    transcriber.canceled = (_s, e) => this.handleCanceled(e.errorDetails);
    transcriber.sessionStopped = () => {
      if (this.stopping) this.callbacks.onStopped();
    };

    await new Promise<void>((resolve, reject) => {
      transcriber.startTranscribingAsync(
        () => resolve(),
        (err) => reject(new Error(err)),
      );
    });

    // If stop() was requested while we were connecting, tear the new transcriber
    // down immediately so the microphone is never left open.
    if (this.stopping) {
      await new Promise<void>((resolve) =>
        transcriber.stopTranscribingAsync(
          () => resolve(),
          () => resolve(),
        ),
      );
      transcriber.close();
      return;
    }
    this.transcriber = transcriber;
  }

  private handleCanceled(details: string | undefined): void {
    // Ignore duplicate cancellations while a reconnect is already pending or in
    // flight — otherwise each event would spawn another transcriber (mic leak).
    if (this.stopping || this.restarting || this.restartTimer !== null) return;
    if (this.restartAttempts < MAX_RESTART_ATTEMPTS) {
      this.restartAttempts += 1;
      this.callbacks.onReconnecting?.(this.restartAttempts);
      const backoff = Math.min(1000 * 2 ** (this.restartAttempts - 1), 15000);
      this.restartTimer = setTimeout(() => {
        this.restartTimer = null;
        if (this.stopping) return;
        void this.restart();
      }, backoff);
    } else {
      this.callbacks.onError(details || 'Transcription was canceled');
    }
  }

  /** Recreates the transcriber after a disconnect, preserving the session clock. */
  private async restart(): Promise<void> {
    if (this.restarting || this.stopping) return;
    this.restarting = true;
    try {
      try {
        this.transcriber?.close();
      } catch {
        /* already closed */
      }
      this.transcriber = null;
      await this.buildAndStart();
      if (!this.stopping) this.callbacks.onReconnected?.();
    } catch (err) {
      this.callbacks.onError(err instanceof Error ? err.message : 'reconnect failed');
    } finally {
      this.restarting = false;
    }
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
    if (isFinal && e.result.reason !== this.sdk?.ResultReason.RecognizedSpeech) return;

    const speakerId = e.result.speakerId || 'Speaker';
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
    this.stopping = true;
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
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
    this.sessionStart = 0;
    this.activeBySpeaker.clear();
  }
}
