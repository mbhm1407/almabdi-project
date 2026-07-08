import {
  teamsDarkTheme,
  teamsHighContrastTheme,
  teamsLightTheme,
  type Theme,
} from '@fluentui/react-components';

export type ThemeMode = 'light' | 'dark' | 'contrast';

/** Maps the app's theme mode to the corresponding Fluent Teams theme. */
export function resolveTheme(mode: ThemeMode): Theme {
  switch (mode) {
    case 'dark':
      return teamsDarkTheme;
    case 'contrast':
      return teamsHighContrastTheme;
    case 'light':
    default:
      return teamsLightTheme;
  }
}

/** Translates a Teams host theme string into the app's theme mode. */
export function themeFromTeams(teamsTheme: string): ThemeMode {
  if (teamsTheme === 'dark') return 'dark';
  if (teamsTheme === 'contrast') return 'contrast';
  return 'light';
}
