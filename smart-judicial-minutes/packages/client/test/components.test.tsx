import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FluentProvider, teamsLightTheme } from '@fluentui/react-components';
import type { ReactElement } from 'react';
import { OpeningScreen } from '../src/features/transcript/components/OpeningScreen';
import { StatusBadge } from '../src/features/transcript/components/StatusBadge';
import { SearchBar } from '../src/features/transcript/components/SearchBar';
import { BookmarksPanel } from '../src/features/transcript/components/BookmarksPanel';
import { StatisticsPanel } from '../src/features/transcript/components/StatisticsPanel';
import { MeetingHeader } from '../src/features/transcript/components/MeetingHeader';
import { TranscriptToolbar } from '../src/features/transcript/components/TranscriptToolbar';
import { AR } from '../src/strings';

function ui(node: ReactElement) {
  return render(
    <FluentProvider dir="rtl" theme={teamsLightTheme}>
      {node}
    </FluentProvider>,
  );
}

describe('OpeningScreen', () => {
  it('renders the official fields and starts documentation', () => {
    const onStart = vi.fn();
    ui(<OpeningScreen defaultTitle="جلسة" clerkName="كاتب" busy={false} onStart={onStart} />);
    expect(screen.getByText(AR.appName)).toBeTruthy();
    expect(screen.getByText(AR.ministry)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: AR.startDocumentation }));
    expect(onStart).toHaveBeenCalledOnce();
    expect(onStart.mock.calls[0]?.[0]).toMatchObject({ meetingTitle: 'جلسة' });
  });
});

describe('StatusBadge', () => {
  it('shows the official status label', () => {
    ui(<StatusBadge status="active" />);
    expect(screen.getByText(AR.statusActive)).toBeTruthy();
  });
});

describe('SearchBar', () => {
  it('shows match position and triggers navigation', () => {
    const onNext = vi.fn();
    ui(
      <SearchBar
        value="جلسة"
        onChange={vi.fn()}
        matchCount={3}
        activeIndex={0}
        onNext={onNext}
        onPrev={vi.fn()}
      />,
    );
    expect(screen.getByText('1/3')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('النتيجة التالية'));
    expect(onNext).toHaveBeenCalled();
  });
});

describe('BookmarksPanel', () => {
  it('shows the empty state and adds a bookmark', () => {
    const onAdd = vi.fn();
    ui(
      <BookmarksPanel
        open
        bookmarks={[]}
        canAdd
        onClose={vi.fn()}
        onAdd={onAdd}
        onRemove={vi.fn()}
        onJump={vi.fn()}
      />,
    );
    expect(screen.getByText(AR.noBookmarks)).toBeTruthy();
    fireEvent.change(screen.getByLabelText(AR.addBookmark), { target: { value: 'بداية الدعوى' } });
    fireEvent.click(screen.getByRole('button', { name: AR.addBookmark }));
    expect(onAdd).toHaveBeenCalledWith('بداية الدعوى');
  });
});

describe('StatisticsPanel', () => {
  it('renders the statistics tiles and connection status', () => {
    ui(
      <StatisticsPanel
        open
        elapsedMs={90_000}
        stats={{ speakers: 2, words: 10, phrases: 4, lastUpdate: null }}
        online
        status="active"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(AR.speakersCount)).toBeTruthy();
    expect(screen.getByText('00:01:30')).toBeTruthy();
  });
});

describe('MeetingHeader', () => {
  it('shows ministry identity and the case number', () => {
    const { container } = ui(
      <MeetingHeader
        caseNumber="435/2/ق"
        circuitName="الدائرة الأولى"
        status="active"
        elapsedMs={0}
        currentSpeaker={null}
        themeMode="light"
        onToggleDark={vi.fn()}
      />,
    );
    expect(container.textContent).toContain(AR.ministry);
    expect(container.textContent).toContain('435/2/ق');
  });
});

describe('TranscriptToolbar', () => {
  it('exposes pause and stop while live', () => {
    const onPause = vi.fn();
    ui(
      <TranscriptToolbar
        status="active"
        sessionId="s1"
        isSaving={false}
        hasSegments
        hasRecording={false}
        bookmarkCount={0}
        searchTerm=""
        matchCount={0}
        activeIndex={-1}
        onSearchChange={vi.fn()}
        onNextMatch={vi.fn()}
        onPrevMatch={vi.fn()}
        onPause={onPause}
        onResume={vi.fn()}
        onStop={vi.fn()}
        onAddBookmark={vi.fn()}
        onOpenBookmarks={vi.fn()}
        onOpenStatistics={vi.fn()}
        onCopyAll={vi.fn()}
        onOpenRecordings={vi.fn()}
        onPrint={vi.fn()}
        onError={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: AR.pause }));
    expect(onPause).toHaveBeenCalled();
  });
});
