import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { SUBWAY_STATIONS } from '../src/data/subwayStations.js';

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(scriptPath), '..');
const stationFilePath = path.join(projectRoot, 'src', 'data', 'subwayStations.js');

function loadEnvFiles() {
  const envFiles = [
    '.env.local',
    '.env',
    '.env.development.local',
    '.env.production.local'
  ];

  for (const fileName of envFiles) {
    const targetPath = path.join(projectRoot, fileName);
    if (fs.existsSync(targetPath)) {
      dotenv.config({ path: targetPath, override: false, quiet: true });
    }
  }
}

function parseArgs(argv) {
  const options = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--')) {
      options._.push(token);
      continue;
    }

    const key = token.slice(2);
    const nextToken = argv[index + 1];

    if (!nextToken || nextToken.startsWith('--')) {
      options[key] = true;
      continue;
    }

    options[key] = nextToken;
    index += 1;
  }

  return options;
}

function normalizeStationName(name) {
  return String(name || '').replace(/\s+/g, '').replace(/\uC5ED$/, '');
}

function ensureStationSuffix(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return '';
  return trimmed.endsWith('\uC5ED') ? trimmed : `${trimmed}\uC5ED`;
}

function normalizeLineApiName(line) {
  const match = String(line || '').match(/(\d+)/);
  if (!match) return String(line || '').trim();
  return `${match[1].padStart(2, '0')}\uD638\uC120`;
}

function normalizeLineDisplayName(line) {
  const match = String(line || '').match(/(\d+)/);
  if (!match) return String(line || '').trim();
  return `${Number(match[1])}\uD638\uC120`;
}

function normalizePlaceName(name) {
  return String(name || '')
    .replace(/\s+/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\uC5ED$/, '');
}

function deriveStationKey(name, lineApiName) {
  const normalizedName = normalizeStationName(name);
  const normalizedLine = normalizeLineApiName(lineApiName).replace(/\s+/g, '');
  return `${normalizedName}-${normalizedLine}`;
}

function escapeNonAscii(value) {
  return value.replace(/[^\x20-\x7E\r\n\t]/g, (character) => {
    const code = character.charCodeAt(0).toString(16).padStart(4, '0');
    return `\\u${code}`;
  });
}

function writeStationModule(stations) {
  const moduleSource =
    `export const SUBWAY_STATIONS = ${escapeNonAscii(JSON.stringify(stations, null, 2))};\n\n` +
    'export const SUBWAY_STATION_LIST = Object.values(SUBWAY_STATIONS);\n';

  fs.writeFileSync(stationFilePath, moduleSource, 'utf8');
}

function findExistingEntry(stations, name, lineApiName) {
  const targetName = normalizeStationName(name);
  const targetLine = normalizeLineApiName(lineApiName);

  return Object.entries(stations).find(([, station]) => {
    return (
      normalizeStationName(station.searchName || station.name) === targetName &&
      normalizeLineApiName(station.lineApiName || station.line) === targetLine
    );
  }) || null;
}

function chooseStationMatch(rows, requestedName, requestedLine) {
  const exactNameRows = rows.filter((row) => {
    return normalizeStationName(row.STATION_NM) === normalizeStationName(requestedName);
  });

  if (requestedLine) {
    const targetLine = normalizeLineApiName(requestedLine);
    const lineMatch = exactNameRows.find((row) => normalizeLineApiName(row.LINE_NUM) === targetLine);

    if (!lineMatch) {
      throw new Error(`LINE_MATCH_NOT_FOUND:${requestedName}:${requestedLine}`);
    }

    return lineMatch;
  }

  if (exactNameRows.length === 1) {
    return exactNameRows[0];
  }

  if (exactNameRows.length > 1) {
    const lineSummary = exactNameRows.map((row) => row.LINE_NUM).join(', ');
    throw new Error(`AMBIGUOUS_STATION:${requestedName}:${lineSummary}`);
  }

  return rows[0] || null;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP_${response.status}`);
  }

  return response.json();
}

async function resolveStationCodes(name, line) {
  const apiKey = process.env.SUBWAY_API_KEY || process.env.VITE_SUBWAY_API_KEY;

  if (!apiKey) {
    throw new Error('MISSING_SUBWAY_API_KEY');
  }

  const candidates = [...new Set([
    ensureStationSuffix(name),
    normalizeStationName(name)
  ].filter(Boolean))];

  for (const candidate of candidates) {
    const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/SearchInfoBySubwayNameService/1/20/${encodeURIComponent(candidate)}/`;
    const payload = await fetchJson(url);
    const rows = payload.SearchInfoBySubwayNameService?.row || [];

    if (!rows.length) {
      continue;
    }

    const match = chooseStationMatch(rows, candidate, line);
    if (match?.STATION_CD) {
      return match;
    }
  }

  throw new Error(`STATION_LOOKUP_FAILED:${name}`);
}

function scorePlace(document, stationName, lineDisplayName, region = '') {
  const normalizedStationName = normalizePlaceName(stationName);
  const normalizedPlace = normalizePlaceName(document.place_name);
  const category = String(document.category_name || '');
  const roadAddress = String(document.road_address_name || '');
  const address = String(document.address_name || '');
  let score = 0;

  if (normalizedPlace === normalizedStationName) score += 6;
  if (normalizedPlace.includes(normalizedStationName)) score += 3;
  if (category.includes('\uC9C0\uD558\uCCA0') || category.includes('\uC804\uCCA0')) score += 5;
  if (category.includes(lineDisplayName)) score += 2;
  if (region && `${roadAddress} ${address}`.includes(region)) score += 4;
  if (roadAddress) score += 1;
  if (address) score += 1;

  return score;
}

async function resolveStationPlace(stationName, lineDisplayName, region = '') {
  const apiKey = process.env.KAKAO_LOCAL_REST_API_KEY;

  const queries = [...new Set([
    `${region} ${ensureStationSuffix(stationName)} ${lineDisplayName}`.trim(),
    `${region} ${ensureStationSuffix(stationName)}`.trim(),
    ensureStationSuffix(stationName),
    `${normalizeStationName(stationName)} ${lineDisplayName}`.trim(),
    normalizeStationName(stationName)
  ].filter(Boolean))];

  if (!apiKey) {
    return resolveStationPlaceByNominatim(queries, stationName, region);
  }

  let bestDocument = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const query of queries) {
    const params = new URLSearchParams({
      query,
      size: '15',
      sort: 'accuracy'
    });

    const payload = await fetchJson(`https://dapi.kakao.com/v2/local/search/keyword.json?${params.toString()}`, {
      headers: {
        Authorization: `KakaoAK ${apiKey}`
      }
    });

    const documents = Array.isArray(payload.documents) ? payload.documents : [];

    for (const document of documents) {
      const score = scorePlace(document, stationName, lineDisplayName, region);
      if (score > bestScore) {
        bestScore = score;
        bestDocument = document;
      }
    }
  }

  if (!bestDocument?.x || !bestDocument?.y) {
    return resolveStationPlaceByNominatim(queries, stationName, region);
  }

  return bestDocument;
}

function scoreNominatimPlace(document, stationName, region = '') {
  const normalizedStationName = normalizePlaceName(stationName);
  const normalizedPlace = normalizePlaceName(document.name || document.display_name || '');
  const category = `${document.class || ''}:${document.type || ''}`;
  let score = 0;

  if (normalizedPlace === normalizedStationName) score += 6;
  if (normalizedPlace.includes(normalizedStationName)) score += 3;
  if (category.includes('railway') || category.includes('station')) score += 4;
  if (String(document.display_name || '').includes('\uC5ED')) score += 1;
  if (region && String(document.display_name || '').includes(region)) score += 4;

  return score;
}

async function resolveStationPlaceByNominatim(queries, stationName, region = '') {
  let bestDocument = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const query of queries) {
    const params = new URLSearchParams({
      q: query,
      format: 'jsonv2',
      limit: '5',
      countrycodes: 'kr',
      'accept-language': 'ko'
    });

    const payload = await fetchJson(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        'User-Agent': 'duxx-subway-manager/1.0'
      }
    });

    const documents = Array.isArray(payload) ? payload : [];

    for (const document of documents) {
      const score = scoreNominatimPlace(document, stationName, region);
      if (score > bestScore) {
        bestScore = score;
        bestDocument = document;
      }
    }
  }

  if (!bestDocument?.lat || !bestDocument?.lon) {
    throw new Error(`PLACE_LOOKUP_FAILED:${stationName}`);
  }

  return {
    x: Number(bestDocument.lon),
    y: Number(bestDocument.lat),
    address_name: bestDocument.display_name || '',
    road_address_name: '',
    phone: ''
  };
}

function buildStationRecord(options, stationInfo, placeInfo, existingEntry) {
  const existingStation = existingEntry?.[1] || null;
  const lineApiName = normalizeLineApiName(stationInfo.LINE_NUM || options.line);
  const line = normalizeLineDisplayName(stationInfo.LINE_NUM || options.line);
  const displayName = ensureStationSuffix(stationInfo.STATION_NM || options.name);
  const searchName = normalizeStationName(stationInfo.STATION_NM || options.name);
  const key = String(options.key || existingStation?.key || deriveStationKey(displayName, lineApiName));

  return {
    key,
    name: displayName,
    searchName,
    line,
    lineApiName,
    coords: {
      lat: Number(placeInfo.y),
      lng: Number(placeInfo.x)
    },
    markerLabel: String(options['marker-label'] || existingStation?.markerLabel || 'S'),
    address: placeInfo.road_address_name || placeInfo.address_name || existingStation?.address || '',
    phone: placeInfo.phone || existingStation?.phone || '',
    stationCd: stationInfo.STATION_CD || existingStation?.stationCd || '',
    frCode: stationInfo.FR_CODE || existingStation?.frCode || ''
  };
}

async function addStation(options) {
  if (!options.name) {
    throw new Error('MISSING_NAME');
  }

  const stationInfo = await resolveStationCodes(options.name, options.line);
  const lineApiName = normalizeLineApiName(stationInfo.LINE_NUM || options.line);
  const existingEntry = findExistingEntry(SUBWAY_STATIONS, stationInfo.STATION_NM, lineApiName);
  const placeInfo = await resolveStationPlace(
    stationInfo.STATION_NM,
    normalizeLineDisplayName(lineApiName),
    String(options.region || '').trim()
  );
  const nextRecord = buildStationRecord(options, stationInfo, placeInfo, existingEntry);
  const nextStations = { ...SUBWAY_STATIONS };

  if (existingEntry) {
    delete nextStations[existingEntry[0]];
  }

  nextStations[nextRecord.key] = nextRecord;

  if (options['dry-run']) {
    console.log(JSON.stringify(nextRecord, null, 2));
    return;
  }

  writeStationModule(nextStations);
  console.log(`Saved subway station: ${nextRecord.name} (${nextRecord.line}) -> ${nextRecord.key}`);
}

function removeStation(options) {
  const nextStations = { ...SUBWAY_STATIONS };
  const targetKey = options.key ? String(options.key) : null;
  let removedEntry = null;

  if (targetKey && nextStations[targetKey]) {
    removedEntry = [targetKey, nextStations[targetKey]];
  } else if (options.name) {
    const targetLine = options.line ? normalizeLineApiName(options.line) : '';
    removedEntry = Object.entries(nextStations).find(([, station]) => {
      const sameName = normalizeStationName(station.searchName || station.name) === normalizeStationName(options.name);
      if (!sameName) return false;
      if (!targetLine) return true;
      return normalizeLineApiName(station.lineApiName || station.line) === targetLine;
    }) || null;
  }

  if (!removedEntry) {
    throw new Error('STATION_NOT_FOUND');
  }

  delete nextStations[removedEntry[0]];

  if (options['dry-run']) {
    console.log(JSON.stringify(removedEntry[1], null, 2));
    return;
  }

  writeStationModule(nextStations);
  console.log(`Removed subway station: ${removedEntry[1].name} (${removedEntry[1].line})`);
}

function printUsage() {
  console.log('Usage:');
  console.log('  npm run subway:add -- --name 철산역 [--line 7호선] [--region 서울] [--key custom-key] [--marker-label S] [--dry-run]');
  console.log('  npm run subway:remove -- --name 철산역 [--line 7호선]');
  console.log('  npm run subway:remove -- --key custom-key');
}

async function main() {
  loadEnvFiles();

  const options = parseArgs(process.argv.slice(2));
  const command = options._[0];

  if (!command || command === '--help' || command === 'help') {
    printUsage();
    return;
  }

  if (command === 'add') {
    await addStation(options);
    return;
  }

  if (command === 'remove') {
    removeStation(options);
    return;
  }

  throw new Error(`UNKNOWN_COMMAND:${command}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
