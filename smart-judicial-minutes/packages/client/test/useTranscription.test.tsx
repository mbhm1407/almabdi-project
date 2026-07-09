import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { TranscriberCallbacks } from '../src/services/speechTranscriber';
import type { TranscriptionSession } from '@smj/shared';

// Capture the callbacks the hook wires into the transcriber so the test can
// drive reconnect events.
let captured: TranscriberCallbacks | null = null;

vi.mock('../src/services/speechTranscriber', () => ({
  SpeechTranscriber: class {
    constructor(cb: TranscriberCallbacks) {
      captured = cb;
    }
    start = vi.fn().mockResolvedValue(undefined);
    stop = vi.fn().mockResolvedValue(undefined);
    pause = vi.fn();
    resume = vi.fn();
  },
}));

vi.mock('../src/services/audioRecorder', () => ({
  AudioRecorder: class {
    start = vi.fn().mockResolvedValue(undefined);
    stop = vi.fn().mockResolvedValue(null);
    pause = vi.fn();
    resume = vi.fn();
    get capturedBytes() {
      return 0;
    }
    get isActive() {
      return true;
    }
  },
}));

const { session } = vi.hoisted(() => ({
  session: {
    id: '11111111-1111-1111-1111-111111111111',
    meetingId: 'm-1',
    meetingTitle: 'جلسة',
    caseNumber: '1/ق',
    circuitName: 'الدائرة',
    judgeName: 'القاضي',
    tenantId: 't-1',
    createdBy: 'u-1',
    status: 'active' as const,
    locale: 'ar-SA',
    startedAt: '2026-07-08T09:00:00.000Z',
    stoppedAt: null,
    recordingBlobName: null,
  } satisfies TranscriptionSession,
}));

vi.mock('../src/services/apiClient', () => ({
  ApiClientError: class extends Error {},
  apiClient: {
    startSession: vi.fn().mockResolvedValue({ session }),
    saveSegments: vi.fn().mockResolvedValue({ saved: 0 }),
    stopSession: vi.fn().mockResolvedValue({ session: { ...session, status: 'stopped' } }),
    saveRecording: vi.fn().mockResolvedValue({ blobName: 'b' }),
  },
}));

import { useTranscription } from '../src/features/transcript/hooks/useTranscription';
import { apiClient } from '../src/services/apiClient';
import type { RecognizedSegment } from '../src/services/speechTranscriber';

const context = {
  meetingId: 'm-1',
  meetingTitle: 'جلسة',
  userName: 'كاتب',
  theme: 'default',
  inTeams: true,
};

const setup = {
  meetingTitle: 'جلسة',
  caseNumber: '1/ق',
  circuitName: 'الدائرة',
  judgeName: 'القاضي',
  participants: [],
};

afterEach(() => {
  captured = null;
  vi.clearAllMocks();
});

describe('useTranscription reconnect state', () => {
  it('goes active on start and toggles isReconnecting on reconnect events', async () => {
    const { result } = renderHook(() => useTranscription(context));

    await act(async () => {
      await result.current.start(setup);
    });
    await waitFor(() => expect(result.current.status).toBe('active'));
    expect(result.current.isReconnecting).toBe(false);
    expect(captured).not.toBeNull();

    act(() => captured!.onReconnecting?.(1));
    expect(result.current.isReconnecting).toBe(true);

    act(() => captured!.onReconnected?.());
    expect(result.current.isReconnecting).toBe(false);
  });
});

describe('useTranscription persistence', () => {
  it('passes circuit and judge to startSession', async () => {
    const { result } = renderHook(() => useTranscription(context));
    await act(async () => {
      await result.current.start(setup);
    });
    expect(apiClient.startSession).toHaveBeenCalledWith(
      expect.objectContaining({ circuitName: 'الدائرة', judgeName: 'القاضي' }),
    );
  });

  it('flushes a large backlog in chunks under the 500-segment server cap', async () => {
    const { result } = renderHook(() => useTranscription(context));
    await act(async () => {
      await result.current.start(setup);
    });

    // Push 600 finalized utterances (e.g. accumulated during an API outage).
    act(() => {
      for (let i = 0; i < 600; i++) {
        const seg: RecognizedSegment = {
          id: `00000000-0000-0000-0000-${i.toString().padStart(12, '0')}`,
          speakerId: 'Guest-1',
          speakerLabel: 'Guest-1',
          speakerRole: 'unassigned',
          text: `مداخلة ${i}`,
          timestamp: '2026-07-08T09:00:00.000Z',
          offsetMs: i * 1000,
          durationMs: 900,
          isFinal: true,
          interim: false,
        };
        captured!.onSegment(seg);
      }
    });

    await act(async () => {
      await result.current.stop();
    });

    const calls = (apiClient.saveSegments as ReturnType<typeof vi.fn>).mock.calls;
    const totalSaved = calls.reduce((n, c) => n + (c[1] as unknown[]).length, 0);
    expect(totalSaved).toBe(600);
    // No single request may exceed the cap.
    for (const c of calls) {
      expect((c[1] as unknown[]).length).toBeLessThanOrEqual(250);
    }
  });
});
