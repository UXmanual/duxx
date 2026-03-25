import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(scriptPath), '..');
const packageJsonPath = path.join(projectRoot, 'package.json');
const publicDirPath = path.join(projectRoot, 'public');
const versionFilePath = path.join(publicDirPath, 'version.json');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = String(packageJson.version || '').trim();

if (!version) {
  console.error('Version sync failed: package.json version is missing.');
  process.exit(1);
}

fs.mkdirSync(publicDirPath, { recursive: true });
fs.writeFileSync(
  versionFilePath,
  `${JSON.stringify({ version }, null, 2)}\n`,
  'utf8'
);

console.log(`Synced public/version.json -> ${version}`);
