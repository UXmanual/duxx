import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(scriptPath), '..');
const packageJsonPath = path.join(projectRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = String(packageJson.version || '').trim();

const args = new Set(process.argv.slice(2));
const isExplicitCheck = args.has('--require-bump');
const isVercelProduction = process.env.VERCEL === '1' && process.env.VERCEL_ENV === 'production';

if (!isExplicitCheck && !isVercelProduction) {
  process.exit(0);
}

if (!currentVersion) {
  console.error('Version check failed: package.json version is missing.');
  process.exit(1);
}

const liveVersionUrl = 'https://duxx.vercel.app/version.json';

let liveVersion = null;

try {
  const response = await fetch(liveVersionUrl, {
    headers: {
      'cache-control': 'no-cache'
    }
  });

  if (response.status === 404) {
    console.warn(`Version check bootstrap: live version file does not exist yet at ${liveVersionUrl}.`);
    process.exit(0);
  }

  if (!response.ok) {
    throw new Error(`HTTP_${response.status}`);
  }

  const payload = await response.json();
  liveVersion = String(payload.version || '').trim();
} catch (error) {
  console.error(`Version check failed: could not read live version from ${liveVersionUrl}.`);
  process.exit(1);
}

if (!liveVersion) {
  console.error(`Version check failed: live version is missing at ${liveVersionUrl}.`);
  process.exit(1);
}

if (liveVersion === currentVersion) {
  console.error(
    `Version bump required before deployment. Current version ${currentVersion} matches live version ${liveVersion}.`
  );
  process.exit(1);
}

console.log(`Version check passed: live ${liveVersion} -> current ${currentVersion}`);
