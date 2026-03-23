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

function coerceNumber(value) {
  const numeric = Number(String(value || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
}

function inferLocationNo(message) {
  const match = String(message || '').match(/(\d+)\s*(번째|정거장)/);
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

async function fetchGyeonggiStation(apiKey, stationNumber) {
  const url = `https://apis.data.go.kr/6410000/busstationservice/v2/getBusStationListv2?serviceKey=${apiKey}&keyword=${encodeURIComponent(
    stationNumber
  )}&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    return { error: `HTTP_${response.status}`, message: 'Failed to fetch Gyeonggi bus station list.' };
  }

  const data = await response.json();
  const header = data?.response?.msgHeader;
  const stations = data?.response?.msgBody?.busStationList || [];

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

  const response = await fetch(url);
  if (!response.ok) {
    return { error: `HTTP_${response.status}`, message: 'Failed to fetch Gyeonggi bus arrival list.' };
  }

  const data = await response.json();
  const header = data?.response?.msgHeader;
  const arrivals = data?.response?.msgBody?.busArrivalList || [];

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

  const response = await fetch(url);
  if (!response.ok) {
    return { error: `HTTP_${response.status}`, message: 'Failed to fetch Seoul bus station arrival list.' };
  }

  const xml = await response.text();
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
      crowded1: mapSeoulCongestion(extractXmlValue(item, 'congetion1')),
      crowded2: mapSeoulCongestion(extractXmlValue(item, 'congetion2')),
      arrivalText1: extractXmlValue(item, 'arrmsg1'),
      arrivalText2: extractXmlValue(item, 'arrmsg2')
    };
  });

  return {
    station,
    arrivals,
    queryTime: extractXmlValue(xml, 'tmX') || null
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
    res.status(result.error ? 200 : 200).json(result);
    return;
  }

  const apiKey = process.env.BUS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'MISSING_API_KEY' });
    return;
  }

  const result = await handleGyeonggi(apiKey, requestedStation);
  res.status(result.error ? 200 : 200).json(result);
}
