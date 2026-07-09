import { describe, expect, it } from 'vitest';
import { buildPrintHtml } from '../src/services/print';
import type { TranscriptSegment } from '@smj/shared';

const meta = {
  caseNumber: '٤٣٥/٢/ق',
  circuitName: 'الدائرة الحقوقية الأولى',
  judgeName: 'أحمد الحربي',
  date: '٨ يوليو ٢٠٢٦',
  durationMs: 1_800_000,
};

function seg(text: string): TranscriptSegment {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    sessionId: '00000000-0000-0000-0000-000000000000',
    speakerId: 'Guest-1',
    speakerLabel: 'القاضي',
    speakerRole: 'judge',
    text,
    timestamp: '2026-07-08T09:41:02.000Z',
    offsetMs: 0,
    durationMs: 1000,
    isFinal: true,
  };
}

describe('buildPrintHtml', () => {
  it('includes the ministry branding and hearing metadata', () => {
    const html = buildPrintHtml(meta, [seg('افتتحت الجلسة')]);
    expect(html).toContain('وزارة العدل');
    expect(html).toContain('٤٣٥/٢/ق');
    expect(html).toContain('الدائرة الحقوقية الأولى');
    expect(html).toContain('أحمد الحربي');
    expect(html).toContain('افتتحت الجلسة');
    expect(html).toMatch(/dir="rtl"/);
  });

  it('escapes HTML in transcript text to prevent injection', () => {
    const html = buildPrintHtml(meta, [seg('<script>alert(1)</script>')]);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('omits interim segments', () => {
    const interim = { ...seg('مؤقت'), isFinal: false };
    const html = buildPrintHtml(meta, [interim]);
    expect(html).not.toContain('مؤقت');
  });
});
