import React, { useState } from 'react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Target } from 'lucide-react';

/**
 * [Page] 메인 페이지 (초기 안정화 버전 복구)
 * @version 8.1.0
 * @author Antigravity
 * @description 
 * - 모든 추가 로직을 배제하고, 카카오맵 초기 연동 시의 가장 깨끗한 소스 코드로 복구했습니다.
 * - 버튼 클릭 시 브라우저 표준 위치 정보를 가져와 지도를 즉시 이동시킵니다.
 */

const Main = () => {
  const { isDark } = useTheme();
  const [map, setMap] = useState(null);
  const [myLocation, setMyLocation] = useState(null);

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAPS_API_KEY,
    libraries: ['services', 'clusterer', 'drawing'],
  });

  // 버튼 클릭 시 수행되는 가장 기본적인 위치 이동 함수
  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newPos = { lat, lng };
          
          setMyLocation(newPos);
          
          if (map) {
            // 지도를 해당 좌표로 부드럽게 이동시키고 줌 레벨을 4로 맞춤
            map.panTo(new window.kakao.maps.LatLng(lat, lng));
            map.setLevel(4);
          }
        },
        (err) => {
          console.error("Geolocation Error:", err);
        }
      );
    }
  };

  if (loading) return null;

  return (
    <div className="w-full h-screen relative">
      <Map
        center={{ lat: 37.5665, lng: 126.9780 }}
        level={4}
        onCreate={setMap}
        style={{ width: '100%', height: '100%' }}
        className={isDark ? 'kakao-dark-theme' : ''}
      >
        {myLocation && <MapMarker position={myLocation} />}
      </Map>

      {/* 우측 하단 기본 버튼 UI */}
      <div className="absolute right-5 bottom-32 z-10">
        <button 
          onClick={handleMyLocation}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center active:bg-gray-100 transition-colors"
        >
          <Target size={24} className="text-gray-800" />
        </button>
      </div>

      <style>{`
        .kakao-dark-theme { filter: invert(100%) hue-rotate(180deg) brightness(0.9); background-color: #fff !important; }
        .kakao-dark-theme img { filter: none !important; }
        @media (max-width: 640px) { .kakao-copyright, .kakao-logo { display: none !important; } }
      `}</style>
    </div>
  );
};

export default Main;
