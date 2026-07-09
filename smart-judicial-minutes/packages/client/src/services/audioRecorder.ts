/**
 * Captures microphone audio with MediaRecorder for later upload to Blob storage.
 * Runs alongside the Speech transcriber (each opens its own media stream) so the
 * clerk can save a verbatim audio copy of the hearing.
 */
export class AudioRecorder {
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];

  private pickMimeType(): string {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];
    for (const type of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = this.pickMimeType();
    this.recorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
    this.chunks = [];
    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.chunks.push(event.data);
    };
    this.recorder.start(1000); // gather data in 1s slices
  }

  /** Temporarily stops writing audio without ending the recording. */
  pause(): void {
    if (this.recorder && this.recorder.state === 'recording') {
      this.recorder.pause();
    }
  }

  /** Resumes writing audio after a {@link pause}. */
  resume(): void {
    if (this.recorder && this.recorder.state === 'paused') {
      this.recorder.resume();
    }
  }

  /** Bytes captured so far across all buffered chunks. */
  get capturedBytes(): number {
    return this.chunks.reduce((total, chunk) => total + chunk.size, 0);
  }

  /** Whether a recording is currently in progress (recording or paused). */
  get isActive(): boolean {
    return this.recorder != null && this.recorder.state !== 'inactive';
  }

  /** Stops recording and returns the assembled audio blob (or null if nothing captured). */
  stop(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const recorder = this.recorder;
      if (!recorder || recorder.state === 'inactive') {
        this.cleanup();
        resolve(null);
        return;
      }
      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm';
        const blob = this.chunks.length ? new Blob(this.chunks, { type }) : null;
        this.cleanup();
        resolve(blob);
      };
      recorder.stop();
    });
  }

  private cleanup(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.recorder = null;
    this.chunks = [];
  }
}
