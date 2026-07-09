import { env } from '../../config/env.js';
import { UpstreamError } from '../../lib/errors.js';
import { logger } from '../../lib/logger.js';
import { withRetry } from '../../lib/retry.js';
import { CircuitBreaker } from '../../lib/circuitBreaker.js';
import type { SpeechToken } from '@smj/shared';

/**
 * Exchanges the Azure Speech subscription key for a short-lived authorization
 * token. The browser uses this token to open a direct WebSocket to Azure Speech
 * for real-time transcription — the subscription key never leaves the server.
 *
 * Tokens are cached and refreshed slightly before their ~10-minute expiry.
 */
const TOKEN_TTL_SECONDS = 9 * 60; // refresh a minute before Azure's 10-minute expiry

class SpeechService {
  private cached: { token: string; expiresAt: number } | null = null;
  // Protect the STS endpoint: fail fast when Azure Speech is down.
  private readonly breaker = new CircuitBreaker('azure-speech-sts', {
    failureThreshold: 5,
    resetTimeoutMs: 30_000,
  });

  private async requestToken(): Promise<string> {
    const url = `https://${env.AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    if (!response.ok) {
      throw new Error(`Speech STS responded ${response.status}`);
    }
    return response.text();
  }

  private async fetchToken(): Promise<string> {
    try {
      return await this.breaker.execute(() =>
        withRetry(() => this.requestToken(), {
          attempts: 3,
          baseDelayMs: 300,
          maxDelayMs: 3_000,
          onRetry: (err, attempt) =>
            logger.warn({ err, attempt }, 'Retrying Azure Speech token request'),
        }),
      );
    } catch (err) {
      logger.error(
        { err, circuit: this.breaker.currentState },
        'Azure Speech token request failed',
      );
      throw new UpstreamError('Could not obtain a speech token');
    }
  }

  async issueToken(): Promise<SpeechToken> {
    const now = Date.now();
    if (!this.cached || this.cached.expiresAt <= now) {
      const token = await this.fetchToken();
      this.cached = { token, expiresAt: now + TOKEN_TTL_SECONDS * 1000 };
    }
    const expiresInSeconds = Math.max(1, Math.floor((this.cached.expiresAt - now) / 1000));
    return {
      token: this.cached.token,
      region: env.AZURE_SPEECH_REGION,
      locale: env.SPEECH_LOCALE,
      expiresInSeconds,
    };
  }
}

export const speechService = new SpeechService();
