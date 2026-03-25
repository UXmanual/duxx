import { SUBWAY_STATIONS } from '../src/data/subwayStations.js';

const stationCodeCache = new Map();

function normalizeStationName(name) {
  return String(name || '').replace(/\s+/g, '').replace(/\uC5ED$/, '');
}

function normalizeLineName(line) {
  const match = String(line || '').match(/(\d+)/);
  if (!match) return String(line || '');
  return `${match[1].padStart(2, '0')}\uD638\uC120`;
}

function getStationDefinition(stationKey) {
  return SUBWAY_STATIONS[String(stationKey || 'seoul').toLowerCase()] || SUBWAY_STATIONS.seoul;
}

function buildLookupCandidates(station) {
  return [...new Set([
    station.searchName,
    station.name,
    String(station.name || '').replace(/\uC5ED$/, '')
  ].filter(Boolean))];
}

function pickBestLookupRow(rows, station) {
  const targetName = normalizeStationName(station.searchName || station.name);
  const targetLine = normalizeLineName(station.lineApiName || station.line);

  return rows.find((row) => {
    const rowName = normalizeStationName(row.STATION_NM);
    const rowLine = normalizeLineName(row.LINE_NUM);
    return rowName === targetName && rowLine === targetLine;
  }) || rows.find((row) => normalizeStationName(row.STATION_NM) === targetName) || null;
}

async function lookupStationCodes(apiKey, station) {
  const cacheKey = `${station.key}:${station.searchName || station.name}:${station.line}`;

  if (station.stationCd && station.frCode) {
    return station;
  }

  if (stationCodeCache.has(cacheKey)) {
    return {
      ...station,
      ...stationCodeCache.get(cacheKey)
    };
  }

  const candidates = buildLookupCandidates(station);

  for (const candidate of candidates) {
    const lookupUrl = `http://openapi.seoul.go.kr:8088/${apiKey}/json/SearchInfoBySubwayNameService/1/20/${encodeURIComponent(candidate)}/`;
    const response = await fetch(lookupUrl);

    if (!response.ok) {
      continue;
    }

    const data = await response.json();
    const rows = data.SearchInfoBySubwayNameService?.row || [];
    const bestMatch = pickBestLookupRow(rows, station);

    if (bestMatch?.STATION_CD) {
      const resolvedCodes = {
        stationCd: bestMatch.STATION_CD,
        frCode: bestMatch.FR_CODE || ''
      };

      stationCodeCache.set(cacheKey, resolvedCodes);

      return {
        ...station,
        ...resolvedCodes
      };
    }
  }

  throw new Error(`STATION_LOOKUP_FAILED:${station.name}`);
}

async function fetchTimetable(apiKey, station, dayType, bound) {
  const resolvedStation = await lookupStationCodes(apiKey, station);
  const attempts = [
    {
      serviceName: 'SearchSTNTimeTableByIDService',
      stationCode: resolvedStation.stationCd
    },
    {
      serviceName: 'SearchSTNTimeTableByFRCodeService',
      stationCode: resolvedStation.frCode
    }
  ].filter((attempt) => attempt.stationCode);

  let lastError = 'UNKNOWN';

  for (const { serviceName, stationCode } of attempts) {
    const targetUrl = `http://openapi.seoul.go.kr:8088/${apiKey}/json/${serviceName}/1/500/${stationCode}/${dayType}/${bound}/`;

    try {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        lastError = `HTTP_${response.status}`;
        continue;
      }

      const data = await response.json();
      const resultCode = data[serviceName]?.RESULT?.CODE || data.RESULT?.CODE || 'UNKNOWN';
      const rows = data[serviceName]?.row || [];

      if (resultCode === 'INFO-000' && rows.length > 0) {
        return {
          SearchSTNTimeTableByIDService: {
            row: rows
          },
          source: {
            serviceName,
            stationCode,
            stationName: resolvedStation.name,
            line: resolvedStation.line,
            stationKey: resolvedStation.key
          },
          station: resolvedStation
        };
      }

      lastError = resultCode;
    } catch (error) {
      lastError = error.message;
    }
  }

  return {
    error: lastError,
    message: `${resolvedStation.name} ${resolvedStation.line} 시간표 API 응답 없음: ${lastError}`,
    source: {
      stationCd: resolvedStation.stationCd,
      frCode: resolvedStation.frCode,
      stationName: resolvedStation.name,
      line: resolvedStation.line,
      stationKey: resolvedStation.key
    },
    station: resolvedStation
  };
}

export default async function handler(req, res) {
  const apiKey = process.env.SUBWAY_API_KEY || process.env.VITE_SUBWAY_API_KEY;
  const { type, dayType = '1', bound = '1', station: stationKey = 'seoul' } = req.query;

  if (!apiKey) {
    res.status(500).json({ error: 'MISSING_API_KEY' });
    return;
  }

  if (type !== 'timetable') {
    res.status(400).json({
      error: 'UNSUPPORTED_TYPE',
      message: 'This endpoint only supports type=timetable.'
    });
    return;
  }

  try {
    const station = getStationDefinition(stationKey);
    const data = await fetchTimetable(apiKey, station, dayType, bound);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: 'SUBWAY_LOOKUP_FAILED',
      message: error.message
    });
  }
}
