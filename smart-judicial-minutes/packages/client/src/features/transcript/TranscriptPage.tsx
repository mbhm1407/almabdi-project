import { useState } from 'react';
import {
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  Button,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import type { TeamsMeetingContext } from '../../teams/teamsClient';
import type { ThemeMode } from '../../theme/themes';
import { useTranscription } from './hooks/useTranscription';
import { MeetingHeader } from './components/MeetingHeader';
import { TranscriptToolbar } from './components/TranscriptToolbar';
import { TranscriptList } from './components/TranscriptList';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  errorBar: {
    marginInline: tokens.spacingHorizontalL,
    marginBlockStart: tokens.spacingVerticalS,
  },
  body: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
});

interface TranscriptPageProps {
  context: TeamsMeetingContext;
  themeMode: ThemeMode;
  onToggleDark: () => void;
}

/**
 * The only screen in the app. Everything the clerk needs is here: meeting info,
 * start/stop, recording status, the live Arabic transcript, search and export.
 */
export function TranscriptPage({ context, themeMode, onToggleDark }: TranscriptPageProps) {
  const styles = useStyles();
  const [searchTerm, setSearchTerm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { status, session, segments, error, isSaving, start, stop, relabelSpeaker, clearError } =
    useTranscription(context);

  const activeError = error ?? localError;
  const dismissError = () => {
    setLocalError(null);
    clearError();
  };

  return (
    <div className={styles.page}>
      <MeetingHeader
        context={context}
        status={status}
        themeMode={themeMode}
        onToggleDark={onToggleDark}
      />

      <TranscriptToolbar
        status={status}
        sessionId={session?.id ?? null}
        isSaving={isSaving}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onStart={() => void start()}
        onStop={() => void stop()}
        onError={setLocalError}
      />

      {activeError && (
        <MessageBar intent="error" className={styles.errorBar}>
          <MessageBarBody>{activeError}</MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button
                appearance="transparent"
                icon={<DismissRegular />}
                aria-label="إغلاق"
                onClick={dismissError}
              />
            }
          />
        </MessageBar>
      )}

      <div className={styles.body}>
        <TranscriptList
          segments={segments}
          searchTerm={searchTerm}
          autoScroll={status === 'active'}
          onRelabel={relabelSpeaker}
        />
      </div>
    </div>
  );
}
