import http from 'node:http';
import https from 'node:https';

const DEFAULT_GYEONGGI_STATION = '14156';
const GYEONGGI_REGION_NAME = '광명';

function extractXmlValue(xml, tagName) {
  const pattern = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, 'i');
  const match = xml.match(pattern);
  return match ? match[1].trim() : '';
}

function extractXmlItems(xml, tagName = 'itemList') {
  const pattern = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, 'gi');
  return [...xml.matchAll(pattern)].map((match) => match[1]);
}

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  return [value];
}

function coerceNumber(value) {
  const numeric = Number(String(value || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
}

function inferLocationNo(message) {
  const match = String(message || '').match(/(\d+)\s*번째/);
  return match ? Number(match[1]) : null;
}

function mapSeoulCongestion(value) {
  const numeric = Number(value);
  if (numeric <= 0 || Number.isNaN(numeric)) return null;
  if (numeric <= 3) return 1;
  if (numeric === 4) return 2;
  return 3;
}

function normalizeSeoulArsId(stationNumber) {
  return String(stationNumber || '').replace(/[^0-9]/g, '');
}

function inferProvider(stationNumber, provider) {
  if (provider === 'seoul' || provider === 'gyeonggi') return provider;
  return String(stationNumber || '').includes('-') ? 'seoul' : 'gyeonggi';
}

function requestText(url, attempts = 2) {
  const transport = url.startsWith('https://') ? https : http;

  return new Promise((resolve, reject) => {
    let lastError = null;

    const run = (remainingAttempts) => {
      const request = transport.get(url, (response) => {
        const chunks = [];

        response.on('data', (chunk) => {
          chunks.push(chunk);
        });

        response.on('end', () => {
          resolve({
            ok: response.statusCode >= 200 && response.statusCode < 300,
            status: response.statusCode || 500,
            text: Buffer.concat(chunks).toString('utf8')
          });
        });
      });

      request.on('error', (error) => {
        lastError = error;

        if (remainingAttempts > 1) {
          run(remainingAttempts - 1);
          return;
        }

        reject(lastError || new Error('REQUEST_FAILED'));
      });

      request.end();
    };

    run(attempts);
  });
}

async function fetchJson(url, failureMessage) {
  const response = await fetch(url);
  if (!response.ok) {
    return { error: `HTTP_${response.status}`, message: failureMessage };
  }

  try {
    return { data: await response.json() };
  } catch (error) {
    return { error: 'INVALID_JSON', message: error.message || failureMessage };
  }
}

async function fetchGyeonggiStation(apiKey, stationNumber) {
  const url = `https://apis.data.go.kr/6410000/busstationservice/v2/getBusStationListv2?serviceKey=${apiKey}&keyword=${encodeURIComponent(
    stationNumber
  )}&format=json`;

  const result = await fetchJson(url, 'Failed to fetch Gyeonggi bus station list.');
  if (result.error) return result;

  const header = result.data?.response?.msgHeader;
  const stations = ensureArray(result.data?.response?.msgBody?.busStationList);

  if (header?.resultCode !== 0) {
    return {
      error: `STATION_${header?.resultCode ?? 'UNKNOWN'}`,
      message: header?.resultMessage || 'Gyeonggi bus station query failed.'
    };
  }

  const station =
    stations.find(
      (item) => String(item.mobileNo || '').trim() === stationNumber && item.regionName === GYEONGGI_REGION_NAME
    ) || stations.find((item) => String(item.mobileNo || '').trim() === stationNumber);

  if (!station) {
    return {
      error: 'STATION_NOT_FOUND',
      message: `No Gyeonggi station matched mobileNo ${stationNumber}.`
    };
  }

  return { station };
}

async function fetchGyeonggiArrivalList(apiKey, stationId) {
  const url = `https://apis.data.go.kr/6410000/busarrivalservice/v2/getBusArrivalListv2?serviceKey=${apiKey}&stationId=${stationId}&format=json`;

  const result = await fetchJson(url, 'Failed to fetch Gyeonggi bus arrival list.');
  if (result.error) return result;

  const header = result.data?.response?.msgHeader;
  const arrivals = ensureArray(result.data?.response?.msgBody?.busArrivalList);

  if (header?.resultCode !== 0) {
    return {
      error: `ARRIVAL_${header?.resultCode ?? 'UNKNOWN'}`,
      message: header?.resultMessage || 'Gyeonggi bus arrival query failed.'
    };
  }

  return { arrivals, queryTime: header?.queryTime || null };
}

function mapGyeonggiStation(station) {
  return {
    id: station.stationId,
    mobileNo: String(station.mobileNo || '').trim(),
    name: station.stationName,
    regionName: station.regionName,
    x: station.x,
    y: station.y,
    provider: 'gyeonggi'
  };
}

async function fetchSeoulStationAndArrivals(apiKey, stationNumber) {
  const arsId = normalizeSeoulArsId(stationNumber);
  const url = `http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid?serviceKey=${apiKey}&arsId=${encodeURIComponent(arsId)}`;

  let response;

  try {
    response = await requestText(url);
  } catch (error) {
    return {
      error: 'SEOUL_FETCH_FAILED',
      message: error?.message || 'Failed to fetch Seoul bus station arrival list.'
    };
  }

  if (!response.ok) {
    return { error: `HTTP_${response.status}`, message: 'Failed to fetch Seoul bus station arrival list.' };
  }

  const xml = response.text;
  const headerCode = extractXmlValue(xml, 'headerCd');
  const headerMessage = extractXmlValue(xml, 'headerMsg');
  const items = extractXmlItems(xml, 'itemList');

  if (headerCode && headerCode !== '0') {
    return {
      error: `SEOUL_${headerCode}`,
      message: headerMessage || 'Seoul bus station query failed.'
    };
  }

  if (items.length === 0) {
    return {
      error: 'STATION_NOT_FOUND',
      message: `No Seoul station matched arsId ${arsId}.`
    };
  }

  const first = items[0];
  const station = {
    id: extractXmlValue(first, 'stId') || arsId,
    mobileNo: extractXmlValue(first, 'arsId') || arsId,
    name: extractXmlValue(first, 'stNm') || extractXmlValue(first, 'stationNm') || '서울 버스 정류장',
    regionName: '서울',
    x: coerceNumber(extractXmlValue(first, 'gpsX')),
    y: coerceNumber(extractXmlValue(first, 'gpsY')),
    provider: 'seoul'
  };

  const arrivals = items.map((item) => {
    const predictSeconds1 = coerceNumber(extractXmlValue(item, 'traTime1'));
    const predictSeconds2 = coerceNumber(extractXmlValue(item, 'traTime2'));

    return {
      routeId: extractXmlValue(item, 'busRouteId') || extractXmlValue(item, 'rtNm'),
      routeName: extractXmlValue(item, 'rtNm') || '-',
      routeDestName: extractXmlValue(item, 'adirection') || extractXmlValue(item, 'nxtStn') || '',
      stationNm1: extractXmlValue(item, 'arrmsg1') || '-',
      stationNm2: extractXmlValue(item, 'arrmsg2') || '-',
      predictTime1: predictSeconds1 !== null ? Math.max(0, Math.ceil(predictSeconds1 / 60)) : null,
      predictTime2: predictSeconds2 !== null ? Math.max(0, Math.ceil(predictSeconds2 / 60)) : null,
      predictTimeSec1: predictSeconds1,
      predictTimeSec2: predictSeconds2,
      locationNo1: inferLocationNo(extractXmlValue(item, 'arrmsg1')),
      locationNo2: inferLocationNo(extractXmlValue(item, 'arrmsg2')),
      lowPlate1: extractXmlValue(item, 'busType1') === '1',
      lowPlate2: extractXmlValue(item, 'busType2') === '1',
      crowded1: mapSeoulCongestion(extractXmlValue(item, 'congestion1') || extractXmlValue(item, 'congetion1')),
      crowded2: mapSeoulCongestion(extractXmlValue(item, 'congestion2') || extractXmlValue(item, 'congetion2')),
      arrivalText1: extractXmlValue(item, 'arrmsg1'),
      arrivalText2: extractXmlValue(item, 'arrmsg2')
    };
  });

  return {
    station,
    arrivals,
    queryTime: null
  };
}

async function handleGyeonggi(apiKey, stationNumber) {
  const stationResult = await fetchGyeonggiStation(apiKey, stationNumber);
  if (stationResult.error) return stationResult;

  const { station } = stationResult;
  const arrivalResult = await fetchGyeonggiArrivalList(apiKey, station.stationId);

  if (arrivalResult.error) {
    return {
      ...arrivalResult,
      station: mapGyeonggiStation(station)
    };
  }

  return {
    station: mapGyeonggiStation(station),
    arrivals: arrivalResult.arrivals,
    queryTime: arrivalResult.queryTime
  };
}

export default async function handler(req, res) {
  try {
    const requestedStation = String(req.query.station || DEFAULT_GYEONGGI_STATION).trim();
    const provider = inferProvider(requestedStation, String(req.query.provider || '').trim());

    if (provider === 'seoul') {
      const apiKey = process.env.SEOUL_BUS_API_KEY;
      if (!apiKey) {
        res.status(500).json({
          error: 'MISSING_SEOUL_BUS_API_KEY',
          message: 'Set SEOUL_BUS_API_KEY to enable Seoul bus arrivals.'
        });
        return;
      }

      const result = await fetchSeoulStationAndArrivals(apiKey, requestedStation);
      res.status(200).json(result);
      return;
    }

    const apiKey = process.env.BUS_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'MISSING_API_KEY' });
      return;
    }

    const result = await handleGyeonggi(apiKey, requestedStation);
    res.status(200).json(result);
  } catch (error) {
    res.status(200).json({
      error: 'BUS_HANDLER_FAILED',
      message: error?.message || 'Bus handler failed.'
    });
  }
}
