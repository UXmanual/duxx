const SEARCH_KEYWORDS = ['관광명소', '문화시설', '공원', '박물관', '전시관'];
const DEFAULT_RADIUS = 1500;
const DEFAULT_SIZE = 5;

function buildDescription(place, keyword) {
  const category = String(place.category_name || '')
    .split('>')
    .map((item) => item.trim())
    .filter(Boolean);

  const categoryLeaf = category[category.length - 1] || '';
  const categoryRoot = category[0] || '';
  const label = categoryLeaf || categoryRoot || keyword;

  if (label.includes('문화유적') || label.includes('유적')) return '문화유적';
  if (label.includes('미술관')) return '미술관';
  if (label.includes('박물관')) return '박물관';
  if (label.includes('전시')) return '전시관';
  if (label.includes('공원')) return '공원';
  if (label.includes('문화')) return '문화시설';
  if (label.includes('관광')) return '관광명소';

  return label || keyword;
}

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function calculateDistanceMeters(from, to) {
  if (!from || !to) return Number.POSITIVE_INFINITY;

  const earthRadius = 6371000;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function normalizePlace(place, origin, keyword) {
  const lat = toNumber(place.y);
  const lng = toNumber(place.x);

  return {
    id: place.id,
    name: place.place_name,
    address: place.road_address_name || place.address_name || '',
    roadAddress: place.road_address_name || '',
    category: place.category_name || keyword,
    description: buildDescription(place, keyword),
    keyword,
    phone: place.phone || '',
    placeUrl: place.place_url || '',
    searchUrl: `https://map.kakao.com/link/search/${encodeURIComponent(place.place_name)}`,
    lat,
    lng,
    distanceMeters: calculateDistanceMeters(origin, { lat, lng })
  };
}

async function searchKeyword(apiKey, keyword, origin, radius, size) {
  const params = new URLSearchParams({
    query: keyword,
    x: String(origin.lng),
    y: String(origin.lat),
    radius: String(radius),
    sort: 'distance',
    size: String(size)
  });

  const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${params.toString()}`, {
    headers: {
      Authorization: `KakaoAK ${apiKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`KAKAO_HTTP_${response.status}`);
  }

  const payload = await response.json();
  const documents = Array.isArray(payload.documents) ? payload.documents : [];
  return documents.map((place) => normalizePlace(place, origin, keyword));
}

export default async function handler(req, res) {
  try {
    const apiKey = process.env.KAKAO_LOCAL_REST_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: 'MISSING_KAKAO_LOCAL_REST_API_KEY',
        message: 'Kakao Local REST API key is not configured.'
      });
      return;
    }

    const lat = toNumber(req.query.lat);
    const lng = toNumber(req.query.lng);
    const radius = toNumber(req.query.radius) || DEFAULT_RADIUS;
    const size = Math.min(toNumber(req.query.size) || DEFAULT_SIZE, DEFAULT_SIZE);

    if (lat === null || lng === null) {
      res.status(400).json({
        error: 'INVALID_COORDS',
        message: 'lat and lng query parameters are required.'
      });
      return;
    }

    const origin = { lat, lng };
    const keywordResults = await Promise.all(
      SEARCH_KEYWORDS.map((keyword) => searchKeyword(apiKey, keyword, origin, radius, size))
    );

    const deduped = [];
    const seen = new Set();

    for (const places of keywordResults) {
      for (const place of places) {
        const dedupeKey = `${place.name}::${place.address}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        deduped.push(place);
      }
    }

    const places = deduped
      .filter((place) => Number.isFinite(place.distanceMeters))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, size);

    res.status(200).json({
      places,
      radius,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'KAKAO_NEARBY_FAILED',
      message: error.message || 'Failed to fetch nearby places from Kakao Local API.'
    });
  }
}
