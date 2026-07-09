import { useEffect, useState } from 'react';
import { FluentProvider, Spinner, Text, makeStyles, tokens } from '@fluentui/react-components';
import { FrameContexts } from '@microsoft/teams-js';
import { getFrameContext, getMeetingContext, type TeamsMeetingContext } from '../teams/teamsClient';
import { resolveTheme } from '../theme/themes';
import { useThemeMode } from '../theme/useThemeMode';
import { TranscriptPage } from '../features/transcript/TranscriptPage';
import { ConfigView } from './ConfigView';

const useStyles = makeStyles({
  provider: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  center: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingHorizontalXXL,
    textAlign: 'center',
  },
});

interface BootstrapState {
  context: TeamsMeetingContext | null;
  frame: FrameContexts | null;
  error: string | null;
  loading: boolean;
}

/**
 * App shell: loads the Teams meeting + frame context, wires up the Fluent theme
 * (RTL, light/dark), and mounts either the config screen or the transcript page.
 */
export function App() {
  const [state, setState] = useState<BootstrapState>({
    context: null,
    frame: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [context, frame] = await Promise.all([getMeetingContext(), getFrameContext()]);
        if (!cancelled) setState({ context, frame, error: null, loading: false });
      } catch (err) {
        if (!cancelled) {
          setState({
            context: null,
            frame: null,
            error: err instanceof Error ? err.message : 'تعذر تحميل التطبيق',
            loading: false,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <ThemedShell state={state} />;
}

function ThemedShell({ state }: { state: BootstrapState }) {
  const styles = useStyles();
  const { mode, toggleDark } = useThemeMode(state.context?.theme ?? 'default');
  const isConfig = state.frame === FrameContexts.settings;

  return (
    <FluentProvider dir="rtl" theme={resolveTheme(mode)} className={styles.provider}>
      {state.loading && (
        <div className={styles.center}>
          <Spinner label="جارٍ التحميل…" labelPosition="below" />
        </div>
      )}
      {!state.loading && state.error && (
        <div className={styles.center}>
          <Text>{state.error}</Text>
        </div>
      )}
      {!state.loading && !state.error && isConfig && <ConfigView />}
      {!state.loading && !state.error && !isConfig && state.context && (
        <TranscriptPage context={state.context} themeMode={mode} onToggleDark={toggleDark} />
      )}
    </FluentProvider>
  );
}
