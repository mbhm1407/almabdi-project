import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
// The validator is a plain ESM script shared with the CI gate.
// @ts-expect-error — .mjs script has no type declarations; typed via runtime shape.
import { validateManifest } from '../../../scripts/validate-manifest.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const manifestPath = join(here, '..', '..', '..', 'teams-app', 'appPackage', 'manifest.json');

const validManifest = {
  manifestVersion: '1.17',
  version: '1.0.0',
  id: '${{TEAMS_APP_ID}}',
  name: { short: 'المحضر الذكي', full: 'المحضر الذكي — Smart Judicial Minutes' },
  developer: { name: 'Ministry' },
  icons: { color: 'color.png', outline: 'outline.png' },
  validDomains: ['${{APP_DOMAIN}}'],
  configurableTabs: [{ context: ['meetingSidePanel'] }],
  webApplicationInfo: { id: '${{ID}}', resource: 'api://x' },
};

describe('validateManifest', () => {
  it('accepts a well-formed manifest', () => {
    expect(validateManifest(validManifest, () => true)).toEqual([]);
  });

  it('flags missing SSO configuration and side panel context', () => {
    const bad = { ...validManifest, webApplicationInfo: {}, configurableTabs: [] };
    const problems = validateManifest(bad, () => true);
    expect(problems.some((p: string) => p.includes('meetingSidePanel'))).toBe(true);
    expect(problems.some((p: string) => p.includes('webApplicationInfo'))).toBe(true);
  });

  it('flags a missing icon file', () => {
    const problems = validateManifest(validManifest, () => false);
    expect(problems.some((p: string) => p.includes('icon file missing'))).toBe(true);
  });

  it('validates the real shipped manifest', () => {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    expect(validateManifest(manifest, () => true)).toEqual([]);
  });
});
