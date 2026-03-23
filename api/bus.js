const BUS_STOP_NUMBER = '14156';

async function fetchStation(apiKey, stationNumber) {
  const url = `https://apis.data.go.kr/6410000/busstationservice/v2/getBusStationListv2?serviceKey=${apiKey}&keyword=${encodeURIComponent(
    stationNumber
  )}&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    return { error: `HTTP_${response.status}`, message: 'Failed to fetch bus station list.' };
  }

  const data = await response.json();
  const header = data?.response?.msgHeader;
  const stations = data?.response?.msgBody?.busStationList || [];

  if (header?.resultCode !== 0) {
    return {
      error: `STATION_${header?.resultCode ?? 'UNKNOWN'}`,
      message: header?.resultMessage || 'Bus station query failed.'
    };
  }

  const station = stations.find(
    (item) => String(item.mobileNo || '').trim() === stationNumber && item.regionName === '광명'
  );

  if (!station) {
    return {
      error: 'STATION_NOT_FOUND',
      message: `No station matched mobileNo ${stationNumber}.`
    };
  }

  return { station };
}

async function fetchArrivalList(apiKey, stationId) {
  const url = `https://apis.data.go.kr/6410000/busarrivalservice/v2/getBusArrivalListv2?serviceKey=${apiKey}&stationId=${stationId}&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    return { error: `HTTP_${response.status}`, message: 'Failed to fetch bus arrival list.' };
  }

  const data = await response.json();
  const header = data?.response?.msgHeader;
  const arrivals = data?.response?.msgBody?.busArrivalList || [];

  if (header?.resultCode !== 0) {
    return {
      error: `ARRIVAL_${header?.resultCode ?? 'UNKNOWN'}`,
      message: header?.resultMessage || 'Bus arrival query failed.'
    };
  }

  return { arrivals, queryTime: header?.queryTime || null };
}

export default async function handler(req, res) {
  const apiKey = process.env.BUS_API_KEY;
  const stationNumber = String(req.query.station || BUS_STOP_NUMBER).trim();

  if (!apiKey) {
    res.status(500).json({ error: 'MISSING_API_KEY' });
    return;
  }

  const stationResult = await fetchStation(apiKey, stationNumber);
  if (stationResult.error) {
    res.status(200).json(stationResult);
    return;
  }

  const { station } = stationResult;
  const arrivalResult = await fetchArrivalList(apiKey, station.stationId);

  if (arrivalResult.error) {
    res.status(200).json({
      ...arrivalResult,
      station: {
        id: station.stationId,
        mobileNo: String(station.mobileNo || '').trim(),
        name: station.stationName,
        regionName: station.regionName,
        x: station.x,
        y: station.y
      }
    });
    return;
  }

  res.status(200).json({
    station: {
      id: station.stationId,
      mobileNo: String(station.mobileNo || '').trim(),
      name: station.stationName,
      regionName: station.regionName,
      x: station.x,
      y: station.y
    },
    arrivals: arrivalResult.arrivals,
    queryTime: arrivalResult.queryTime
  });
}
