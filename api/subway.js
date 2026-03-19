export default async function handler(req, res) {
  const apiKey = process.env.VITE_SUBWAY_API_KEY;
  const { type, dayType, bound } = req.query; // type: arrival or timetable

  if (type === 'timetable') {
    // [공식 시간표 조회] 서울역(0150), 요일(dayType: 1-평일, 2-토, 3-일), 상하행(bound: 1-상행, 2-하행)
    // OA-101 서비스는 일반 데이터 광장 API 키가 필요함 (v45.1)
    const stationCode = "0150";
    const dType = dayType || "1";
    const bType = bound || "1";
    
    // 포트 8088 (http) 사용이 표준이며, 인증키 불일치 시 INFO-001 반환됨
    const targetUrl = `http://openAPI.seoul.go.kr:8088/${apiKey}/json/SearchSTNTimeTableByIDService/1/500/${stationCode}/${dType}/${bType}/`;

    try {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        const errText = await response.text();
        res.status(200).json({ error: `HTTP ${response.status}`, details: errText });
        return;
      }
      
      const data = await response.json();
      
      // 결과 코드 추출 (RESULT.CODE 또는 SearchSTNTimeTableByIDService.RESULT.CODE)
      const resCode = data.SearchSTNTimeTableByIDService?.RESULT?.CODE || data.RESULT?.CODE || "";
      if (resCode && resCode !== 'INFO-000') {
        const errMsg = data.SearchSTNTimeTableByIDService?.RESULT?.MESSAGE || data.RESULT?.MESSAGE || "알 수 없는 오류";
        res.status(200).json({ 
          error: resCode, 
          message: `[서울시 API 오류] ${resCode}: ${errMsg}. (참고: 실시간용 키와 데이터광장용 키가 다를 수 있습니다.)` 
        });
        return;
      }
      
      res.status(200).json(data);
    } catch (error) {
      res.status(200).json({ error: 'FETCH_ERROR', message: `네트워크 오류: ${error.message}` });
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
