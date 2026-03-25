import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(scriptPath), '..');
const packageJsonPath = path.join(projectRoot, 'package.json');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = String(packageJson.version || '').trim();

if (!/^\d+(?:\.\d+)+$/.test(version)) {
  console.error(`Version bump failed: unsupported version format "${version}".`);
  process.exit(1);
}

const parts = version.split('.').map(Number);
if (parts.length !== 2) {
  console.error(`Version bump failed: expected major.minor format, received "${version}".`);
  process.exit(1);
}

let [major, minor] = parts;
minor += 1;

if (minor >= 10) {
  major += 1;
  minor = 0;
}

const nextVersion = `${major}.${minor}`;

packageJson.version = nextVersion;
fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');

console.log(`Bumped version ${version} -> ${nextVersion}`);
