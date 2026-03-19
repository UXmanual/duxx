export default async function handler(req, res) {
  const apiKey = process.env.VITE_SUBWAY_API_KEY || process.env.SUBWAY_API_KEY;
  const { type, dayType, bound } = req.query; 

  if (type === 'timetable') {
    const dType = dayType || "1";
    const bType = bound || "1";
    
    // 서울역 1호선 시도할 코드 리스트 및 유사 서비스명 교차 대조 (v46.1)
    const tryCodes = ["0150", "150", "133", "0151"];
    const tryServices = ["SearchSTNTimeTableByIDService", "SearchSubwayTimeTableByIDService"];
    
    let finalData = null;
    let lastError = null;

    for (const serviceName of tryServices) {
      if (finalData) break;
      for (const stationCode of tryCodes) {
        // [v46.1] 구형 서버 규격을 위해 마지막 슬래시(/) 추가
        const targetUrl = `http://openAPI.seoul.go.kr:8088/${apiKey}/json/${serviceName}/1/500/${stationCode}/${dType}/${bType}/`;
        try {
          const response = await fetch(targetUrl);
          if (!response.ok) continue;
          const data = await response.json();
          
          const resCode = data[serviceName]?.RESULT?.CODE || data.RESULT?.CODE || "";
          if (resCode === 'INFO-000' && data[serviceName]?.row?.length > 0) {
            finalData = {
              SearchSTNTimeTableByIDService: {
                row: data[serviceName].row
              }
            };
            break;
          } else {
            lastError = resCode || "DATA_NOT_FOUND";
          }
        } catch (e) { lastError = e.message; }
      }
    }

    if (finalData) {
      res.status(200).json(finalData);
    } else {
      res.status(200).json({ 
        error: lastError, 
        message: `서울역 데이터(0150/150/133) 검색 실패: ${lastError}. (인증키 권한 또는 요일 타입 확인 필요)` 
      });
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
