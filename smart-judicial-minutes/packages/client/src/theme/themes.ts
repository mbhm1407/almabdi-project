import {
  createDarkTheme,
  createHighContrastTheme,
  createLightTheme,
  type Theme,
} from '@fluentui/react-components';
import { ministryGreen } from './brand';

export type ThemeMode = 'light' | 'dark' | 'contrast';

// Build the Ministry-branded themes once from the green ramp.
const lightTheme: Theme = createLightTheme(ministryGreen);
const darkTheme: Theme = createDarkTheme(ministryGreen);
const contrastTheme: Theme = createHighContrastTheme();

// Nudge dark-mode brand-on-surface tokens so the green stays legible on dark.
darkTheme.colorBrandForeground1 = ministryGreen[110];
darkTheme.colorBrandForeground2 = ministryGreen[120];

/** Maps the app's theme mode to the corresponding Ministry-branded theme. */
export function resolveTheme(mode: ThemeMode): Theme {
  switch (mode) {
    case 'dark':
      return darkTheme;
    case 'contrast':
      return contrastTheme;
    case 'light':
    default:
      return lightTheme;
  }
}

/** Translates a Teams host theme string into the app's theme mode. */
export function themeFromTeams(teamsTheme: string): ThemeMode {
  if (teamsTheme === 'dark') return 'dark';
  if (teamsTheme === 'contrast') return 'contrast';
  return 'light';
}
