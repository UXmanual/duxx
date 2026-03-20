const SEOUL_STATION_CODES = {
  frCode: '133',
  stationCd: '0150'
};

async function fetchTimetable(apiKey, dayType, bound) {
  const attempts = [
    {
      serviceName: 'SearchSTNTimeTableByIDService',
      stationCode: SEOUL_STATION_CODES.stationCd
    },
    {
      serviceName: 'SearchSTNTimeTableByFRCodeService',
      stationCode: SEOUL_STATION_CODES.frCode
    }
  ];

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
            stationName: '서울역',
            line: '1호선'
          }
        };
      }

      lastError = resultCode;
    } catch (error) {
      lastError = error.message;
    }
  }

  return {
    error: lastError,
    message: `서울역 1호선 시간표 API 응답 없음: ${lastError}`,
    source: {
      stationCd: SEOUL_STATION_CODES.stationCd,
      frCode: SEOUL_STATION_CODES.frCode,
      stationName: '서울역',
      line: '1호선'
    }
  };
}

export default async function handler(req, res) {
  const apiKey = process.env.SUBWAY_API_KEY || process.env.VITE_SUBWAY_API_KEY;
  const { type, dayType = '1', bound = '1' } = req.query;

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

  const data = await fetchTimetable(apiKey, dayType, bound);
  res.status(200).json(data);
}
