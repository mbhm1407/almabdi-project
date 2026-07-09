import { describe, expect, it } from 'vitest';
import { ministryGreen } from '../src/theme/brand';
import { resolveTheme, themeFromTeams } from '../src/theme/themes';

describe('ministry brand', () => {
  it('defines the full 16-shade Fluent brand ramp', () => {
    const keys = Object.keys(ministryGreen)
      .map(Number)
      .sort((a, b) => a - b);
    expect(keys).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160]);
  });

  it('uses a green primary (more green than red/blue) at shade 80', () => {
    const hex = ministryGreen[80];
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    expect(g).toBeGreaterThan(r);
    expect(g).toBeGreaterThan(b);
  });
});

describe('resolveTheme', () => {
  it('returns branded themes carrying the ministry green', () => {
    const light = resolveTheme('light');
    const dark = resolveTheme('dark');
    expect(light.colorBrandBackground).toBeTruthy();
    expect(dark.colorBrandForeground1).toBe(ministryGreen[110]);
  });
});

describe('themeFromTeams', () => {
  it('maps Teams host themes to app modes', () => {
    expect(themeFromTeams('dark')).toBe('dark');
    expect(themeFromTeams('contrast')).toBe('contrast');
    expect(themeFromTeams('default')).toBe('light');
  });
});
