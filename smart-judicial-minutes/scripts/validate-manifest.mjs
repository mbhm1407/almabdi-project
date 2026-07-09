#!/usr/bin/env node
/**
 * Validates the Teams app manifest before packaging/release:
 *  - required fields are present and well-formed,
 *  - the meeting side panel context is declared,
 *  - SSO (webApplicationInfo) is configured, and
 *  - the referenced icon files exist.
 *
 * Exits non-zero (with a list of problems) on any failure, so it can gate CI.
 *
 * Usage: node scripts/validate-manifest.mjs
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'teams-app', 'appPackage');

/**
 * Pure validator so it can also be unit-tested. `iconExists` is injectable.
 * @returns {string[]} list of problems (empty means valid)
 */
export function validateManifest(manifest, iconExists) {
  const problems = [];
  const req = (cond, message) => {
    if (!cond) problems.push(message);
  };

  req(manifest.manifestVersion, 'manifestVersion is required');
  req(/^\d+\.\d+\.\d+$/.test(manifest.version ?? ''), 'version must be semver (x.y.z)');
  req(manifest.id, 'id is required');
  req(manifest.name?.short, 'name.short is required');
  req(manifest.name?.full, 'name.full is required');
  req(manifest.developer?.name, 'developer.name is required');
  req(manifest.icons?.color, 'icons.color is required');
  req(manifest.icons?.outline, 'icons.outline is required');
  req(Array.isArray(manifest.validDomains), 'validDomains must be an array');

  // Meeting side panel must be reachable via a configurable tab.
  const contexts = (manifest.configurableTabs ?? []).flatMap((t) => t.context ?? []);
  req(contexts.includes('meetingSidePanel'), 'a configurableTab must declare the meetingSidePanel context');

  // Teams SSO.
  req(manifest.webApplicationInfo?.id, 'webApplicationInfo.id (SSO) is required');
  req(manifest.webApplicationInfo?.resource, 'webApplicationInfo.resource (SSO) is required');

  // Icons exist on disk.
  if (manifest.icons?.color) req(iconExists(manifest.icons.color), `icon file missing: ${manifest.icons.color}`);
  if (manifest.icons?.outline) req(iconExists(manifest.icons.outline), `icon file missing: ${manifest.icons.outline}`);

  return problems;
}

function main() {
  const manifestPath = join(pkgDir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    console.error(`Manifest not found at ${manifestPath}`);
    process.exit(1);
  }
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  } catch (err) {
    console.error(`Manifest is not valid JSON: ${err.message}`);
    process.exit(1);
  }
  const problems = validateManifest(manifest, (name) => existsSync(join(pkgDir, name)));
  if (problems.length > 0) {
    console.error('Teams manifest validation failed:');
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log('Teams manifest is valid.');
}

// Only run the CLI when executed directly (not when imported by tests).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
