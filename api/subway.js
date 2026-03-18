export default async function handler(req, res) {
  const apiKey = process.env.VITE_SUBWAY_API_KEY;
  // 서울역 정보를 더 정확하게 가져오기 위해 스테이션 명칭을 '서울역'으로 최적화 (v39.2)
  const stationName = encodeURIComponent("서울역");
  const targetUrl = `http://swopenapi.seoul.go.kr/api/subway/${apiKey}/json/realtimeStationArrival/0/10/${stationName}`;

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Subway Proxy Error:', error);
    res.status(500).json({ error: '지하철 데이터를 가져오는 중 오류가 발생했습니다.', details: error.message });
  }
}
