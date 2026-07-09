import { describe, expect, it } from 'vitest';
import { AR } from '../src/strings';

describe('Arabic strings', () => {
  it('uses the official Ministry action labels', () => {
    expect(AR.startDocumentation).toBe('بدء التوثيق');
    expect(AR.stopDocumentation).toBe('إيقاف التوثيق');
    expect(AR.pause).toBe('إيقاف مؤقت');
    expect(AR.resume).toBe('استئناف');
    expect(AR.search).toBe('البحث');
    expect(AR.export).toBe('تصدير');
    expect(AR.settings).toBe('الإعدادات');
    expect(AR.attendees).toBe('الحاضرون');
    expect(AR.liveTranscript).toBe('النص المباشر');
    expect(AR.recording).toBe('التسجيل الصوتي');
  });

  it('contains no Latin/technical characters in user-facing action labels', () => {
    const actionLabels = [
      AR.startDocumentation,
      AR.stopDocumentation,
      AR.pause,
      AR.resume,
      AR.search,
      AR.export,
      AR.addBookmark,
      AR.statistics,
    ];
    for (const label of actionLabels) {
      expect(label).not.toMatch(/[A-Za-z]/);
    }
  });
});
