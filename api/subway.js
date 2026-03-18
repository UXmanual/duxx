// Vercel Serverless Function (v39.1)
// API 요청 시 발생하는 CORS 및 Mixed Content 문제를 해결하기 위한 프록시 서버입니다.

export default async function handler(req, res) {
  const apiKey = process.env.VITE_SUBWAY_API_KEY;
  const targetUrl = `http://swopenapi.seoul.go.kr/api/subway/${apiKey}/json/realtimeStationArrival/0/5/%EC%84%9C%EC%9A%B8`;

  try {
    const response = await fetch(targetUrl);
    const data = await response.json();
    
    // 성공적으로 데이터를 받으면 프론트엔드로 전달
    res.status(200).json(data);
  } catch (error) {
    console.error('Subway Proxy Error:', error);
    res.status(500).json({ error: '지하철 데이터를 가져오는 중 오류가 발생했습니다.' });
  }
}
