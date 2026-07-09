import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FluentProvider, teamsLightTheme } from '@fluentui/react-components';
import { SegmentRow } from '../src/features/transcript/components/SegmentRow';
import type { TranscriptSegment } from '@smj/shared';

const segment: TranscriptSegment = {
  id: '11111111-1111-1111-1111-111111111111',
  sessionId: '00000000-0000-0000-0000-000000000000',
  speakerId: 'Guest-1',
  speakerLabel: 'أحمد الحربي',
  speakerRole: 'judge',
  text: 'افتتحت الجلسة',
  timestamp: '2026-07-08T09:41:02.000Z',
  offsetMs: 0,
  durationMs: 1200,
  isFinal: true,
};

function renderRow(overrides: Partial<Parameters<typeof SegmentRow>[0]> = {}) {
  return render(
    <FluentProvider dir="rtl" theme={teamsLightTheme}>
      <SegmentRow
        segment={overrides.segment ?? segment}
        participants={overrides.participants ?? []}
        searchTerm={overrides.searchTerm ?? ''}
        isActiveMatch={overrides.isActiveMatch ?? false}
        onAssign={overrides.onAssign ?? vi.fn()}
      />
    </FluentProvider>,
  );
}

describe('SegmentRow', () => {
  it('shows the speaker name, judicial role and Arabic text', () => {
    const { container } = renderRow();
    expect(container.textContent).toContain('أحمد الحربي');
    expect(container.textContent).toContain('القاضي');
    expect(screen.getByText('افتتحت الجلسة')).toBeTruthy();
  });

  it('highlights the search term inside the text', () => {
    renderRow({ searchTerm: 'الجلسة' });
    const marks = document.querySelectorAll('mark');
    expect(marks.length).toBe(1);
    expect(marks[0]?.textContent).toBe('الجلسة');
  });

  it('exposes a copy-line control', () => {
    renderRow();
    expect(screen.getByLabelText('نسخ السطر')).toBeTruthy();
  });
});
