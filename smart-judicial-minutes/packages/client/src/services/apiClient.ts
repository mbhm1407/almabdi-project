import { getSsoToken } from '../teams/teamsClient';
import type {
  ApiError,
  CreateSessionInput,
  CreateSegmentInput,
  ExportFormat,
  SpeechToken,
  TranscriptSegment,
  TranscriptionSession,
} from '@smj/shared';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  parse: 'json' | 'blob' = 'json',
): Promise<T> {
  const token = await getSsoToken();
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (!(options.body instanceof Blob) && !headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    let code = 'ERROR';
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as ApiError;
      code = body.error.code;
      message = body.error.message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiClientError(response.status, code, message);
  }

  if (parse === 'blob') {
    return response.blob() as Promise<T>;
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const apiClient = {
  // ---- Speech ----
  getSpeechToken(): Promise<SpeechToken> {
    return request<SpeechToken>('/api/speech/token');
  },

  // ---- Sessions ----
  startSession(input: CreateSessionInput): Promise<{ session: TranscriptionSession }> {
    return request('/api/sessions', { method: 'POST', body: JSON.stringify(input) });
  },
  stopSession(sessionId: string): Promise<{ session: TranscriptionSession }> {
    return request(`/api/sessions/${sessionId}/stop`, { method: 'POST' });
  },
  listSessions(meetingId: string): Promise<{ sessions: TranscriptionSession[] }> {
    return request(`/api/sessions?meetingId=${encodeURIComponent(meetingId)}`);
  },

  // ---- Transcript segments ----
  saveSegments(sessionId: string, segments: CreateSegmentInput[]): Promise<{ saved: number }> {
    return request(`/api/sessions/${sessionId}/segments`, {
      method: 'POST',
      body: JSON.stringify({ segments }),
    });
  },
  getSegments(sessionId: string): Promise<{ segments: TranscriptSegment[] }> {
    return request(`/api/sessions/${sessionId}/segments`);
  },
  searchSegments(sessionId: string, q: string): Promise<{ segments: TranscriptSegment[] }> {
    return request(`/api/sessions/${sessionId}/search?q=${encodeURIComponent(q)}`);
  },

  // ---- Export ----
  exportTranscript(sessionId: string, format: ExportFormat): Promise<Blob> {
    return request<Blob>(`/api/sessions/${sessionId}/export?format=${format}`, {}, 'blob');
  },

  // ---- Recording ----
  async saveRecording(sessionId: string, audio: Blob): Promise<{ blobName: string }> {
    return request(`/api/sessions/${sessionId}/recording`, {
      method: 'POST',
      body: audio,
      headers: { 'Content-Type': audio.type || 'audio/webm' },
    });
  },
};

export { ApiClientError };
