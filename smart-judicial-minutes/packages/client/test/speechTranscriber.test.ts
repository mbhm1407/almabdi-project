import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TranscriberCallbacks } from '../src/services/speechTranscriber';

// Fake Azure Speech SDK: records every ConversationTranscriber instance so the
// test can drive lifecycle events (cancellation → auto-reconnect).
type FakeTranscriber = { canceled?: (s: unknown, e: { errorDetails?: string }) => void };
const instances: FakeTranscriber[] = [];

vi.mock('microsoft-cognitiveservices-speech-sdk', () => {
  class ConversationTranscriber {
    transcribing: unknown;
    transcribed: unknown;
    canceled: ((s: unknown, e: { errorDetails?: string }) => void) | undefined;
    sessionStopped: unknown;
    constructor() {
      instances.push(this as unknown as FakeTranscriber);
    }
    startTranscribingAsync(cb: () => void) {
      cb();
    }
    stopTranscribingAsync(cb: () => void) {
      cb();
    }
    close() {}
  }
  return {
    SpeechConfig: {
      fromAuthorizationToken: () => ({ speechRecognitionLanguage: '', authorizationToken: '' }),
    },
    AudioConfig: { fromDefaultMicrophoneInput: () => ({}) },
    ConversationTranscriber,
    ResultReason: { RecognizedSpeech: 1 },
  };
});

vi.mock('../src/services/apiClient', () => ({
  apiClient: {
    getSpeechToken: vi
      .fn()
      .mockResolvedValue({ token: 't', region: 'r', locale: 'ar-SA', expiresInSeconds: 540 }),
  },
}));

import { SpeechTranscriber } from '../src/services/speechTranscriber';

function callbacks(): TranscriberCallbacks {
  return {
    onSegment: vi.fn(),
    onError: vi.fn(),
    onStopped: vi.fn(),
    onReconnecting: vi.fn(),
    onReconnected: vi.fn(),
  };
}

afterEach(() => {
  instances.length = 0;
  vi.clearAllMocks();
});

describe('SpeechTranscriber auto-reconnect', () => {
  it('rebuilds the transcriber after a transient cancellation', async () => {
    const cbs = callbacks();
    const t = new SpeechTranscriber(cbs);
    await t.start();
    expect(instances).toHaveLength(1);

    // Simulate a mid-hearing disconnect.
    instances[0]!.canceled?.(null, { errorDetails: 'network glitch' });
    expect(cbs.onReconnecting).toHaveBeenCalledWith(1);

    // A new transcriber is created once the backoff elapses.
    await vi.waitFor(() => expect(instances).toHaveLength(2), { timeout: 4000 });
    expect(cbs.onReconnected).toHaveBeenCalled();
    expect(cbs.onError).not.toHaveBeenCalled();

    await t.stop();
  });

  it('does not reconnect after an intentional stop', async () => {
    const cbs = callbacks();
    const t = new SpeechTranscriber(cbs);
    await t.start();
    await t.stop();

    instances[0]!.canceled?.(null, { errorDetails: 'after stop' });
    // No reconnect scheduled once stopping.
    expect(cbs.onReconnecting).not.toHaveBeenCalled();
    expect(instances).toHaveLength(1);
  });
});
