import { useCallback, useEffect, useState } from 'react';
import { registerThemeChangeHandler } from '../teams/teamsClient';
import { themeFromTeams, type ThemeMode } from './themes';

const STORAGE_KEY = 'smj.themeMode';

/**
 * Owns the active theme mode. Initial value follows the Teams host theme (or a
 * previously saved manual choice), and stays in sync when the host theme
 * changes. The user can override it with the in-app dark-mode toggle.
 */
export function useThemeMode(initialTeamsTheme: string): {
  mode: ThemeMode;
  toggleDark: () => void;
  setMode: (mode: ThemeMode) => void;
} {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return saved ?? themeFromTeams(initialTeamsTheme);
  });
  const [manual, setManual] = useState<boolean>(() => localStorage.getItem(STORAGE_KEY) !== null);

  useEffect(() => {
    registerThemeChangeHandler((teamsTheme) => {
      if (!manual) {
        setModeState(themeFromTeams(teamsTheme));
      }
    });
  }, [manual]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    setManual(true);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleDark = useCallback(() => {
    setModeState((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
    setManual(true);
  }, []);

  return { mode, toggleDark, setMode };
}
