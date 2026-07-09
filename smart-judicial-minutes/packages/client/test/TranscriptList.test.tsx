import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FluentProvider, teamsLightTheme } from '@fluentui/react-components';
import { TranscriptList } from '../src/features/transcript/components/TranscriptList';
import type { TranscriptSegment } from '@smj/shared';

function seg(id: string, text: string, speaker = 'القاضي'): TranscriptSegment {
  return {
    id,
    sessionId: '00000000-0000-0000-0000-000000000000',
    speakerId: speaker,
    speakerLabel: speaker,
    text,
    timestamp: '2026-07-08T09:41:02.000Z',
    offsetMs: 0,
    durationMs: 1000,
    isFinal: true,
  };
}

function renderList(props: Partial<Parameters<typeof TranscriptList>[0]> = {}) {
  return render(
    <FluentProvider dir="rtl" theme={teamsLightTheme}>
      <TranscriptList
        segments={props.segments ?? []}
        searchTerm={props.searchTerm ?? ''}
        autoScroll={false}
        onRelabel={props.onRelabel ?? vi.fn()}
      />
    </FluentProvider>,
  );
}

describe('TranscriptList', () => {
  it('shows the start prompt when there are no segments', () => {
    renderList();
    expect(screen.getByText(/بدء النسخ المباشر/)).toBeTruthy();
  });

  it('renders all segments when there is no search term', () => {
    renderList({
      segments: [
        seg('11111111-1111-1111-1111-111111111111', 'افتتحت الجلسة.'),
        seg('22222222-2222-2222-2222-222222222222', 'أطالب بإلزام المدعى عليه.'),
      ],
    });
    expect(screen.getByText('افتتحت الجلسة.')).toBeTruthy();
    expect(screen.getByText('أطالب بإلزام المدعى عليه.')).toBeTruthy();
  });

  it('filters segments by the search term', () => {
    renderList({
      segments: [
        seg('11111111-1111-1111-1111-111111111111', 'افتتحت الجلسة.'),
        seg('22222222-2222-2222-2222-222222222222', 'أطالب بإلزام المدعى عليه.'),
      ],
      searchTerm: 'أطالب',
    });
    expect(screen.queryByText('افتتحت الجلسة.')).toBeNull();
    expect(screen.getByText('أطالب بإلزام المدعى عليه.')).toBeTruthy();
  });

  it('shows a no-results message when the search matches nothing', () => {
    renderList({
      segments: [seg('11111111-1111-1111-1111-111111111111', 'افتتحت الجلسة.')],
      searchTerm: 'غير موجود',
    });
    expect(screen.getByText(/لا توجد نتائج/)).toBeTruthy();
  });
});
