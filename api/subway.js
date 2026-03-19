export default async function handler(req, res) {
  const apiKey = process.env.VITE_SUBWAY_API_KEY;
  const { type, dayType, bound } = req.query; // type: arrival or timetable

  if (type === 'timetable') {
    // [공식 시간표 조회] 서울역(0150), 요일(dayType: 1-평일, 2-토, 3-일), 상하행(bound: 1-상행, 2-하행)
    const stationCode = "0150";
    const dType = dayType || "1";
    const bType = bound || "1";
    const targetUrl = `http://openAPI.seoul.go.kr:8088/${apiKey}/json/SearchSTNTimeTableByIDService/1/500/${stationCode}/${dType}/${bType}/`;

    try {
      const response = await fetch(targetUrl);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Timetable API Error', details: error.message });
    }
    return;
  }

  // [기존 실시간 정보 조회]
  const stationName = encodeURIComponent("서울");
  const arrivalUrl = `http://swopenapi.seoul.go.kr/api/subway/${apiKey}/json/realtimeStationArrival/0/15/${stationName}`;

  try {
    const response = await fetch(arrivalUrl);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Arrival API Error', details: error.message });
  }
}
