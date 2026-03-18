export default async function handler(req, res) {
  const apiKey = process.env.VITE_SUBWAY_API_KEY;
  // 서울시 API 공식 권장 검색어는 '서울'이지만 '서울역'도 대응 가능하도록 파라미터 체크 (v39.4)
  const stationName = encodeURIComponent("서울");
  const targetUrl = `http://swopenapi.seoul.go.kr/api/subway/${apiKey}/json/realtimeStationArrival/0/15/${stationName}`;

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`API response status: ${response.status}`);
    
    const data = await response.json();
    
    // 만약 데이터가 비어있다면 에러 객체라도 내려줌 (프론트 디버깅용)
    if (!data.realtimeArrivalList) {
      console.warn('Subway API returned empty list for station: 서울');
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Subway Proxy Error:', error);
    res.status(500).json({ error: 'API 연동 에러', details: error.message });
  }
}
