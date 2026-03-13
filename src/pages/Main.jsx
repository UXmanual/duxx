import React, { useState, useRef } from 'react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Target } from 'lucide-react';

/**
 * [Page] 메인 페이지 (기본 초경량 복구 버전)
 * @version 8.0.0
 * @author Antigravity
 * @description 
 * - 시스템 간섭을 최소화하기 위해 모든 복잡한 위치 추적 및 백그라운드 로직을 제거했습니다.
 * - 버튼 클릭 시에만 표준 브라우저 API를 통해 위치를 한 번 가져옵니다.
 */

const Main = () => {
  const { isDark } = useTheme();
  const [map, setMap] = useState(null);
  const [myLocation, setMyLocation] = useState(null);

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAPS_API_KEY,
    libraries: ['services', 'clusterer', 'drawing'],
  });

  const moveToMyLocation = () => {
    if (!navigator.geolocation) return;

    // 표준 브라우저 기본 설정으로 호출
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const pos = { lat: latitude, lng: longitude };
        setMyLocation(pos);
        
        if (map) {
          map.panTo(new window.kakao.maps.LatLng(latitude, longitude));
          map.setLevel(4);
        }
      },
      (err) => {
        // 에러 시 최소한의 안내만 제공
        if (err.code === 1) alert("위치 권한을 허용해 주세요.");
      }
    );
  };

  if (loading) return null;

  return (
    <div className="w-full h-screen relative bg-white overflow-hidden">
      <Map
        center={{ lat: 37.5665, lng: 126.9780 }}
        level={4}
        onCreate={(m) => {
          setMap(m);
          m.setMaxLevel(11);
          setTimeout(() => m.relayout(), 100);
        }}
        style={{ width: '100%', height: '100%' }}
        className={isDark ? 'kakao-dark-theme' : ''}
      >
        {myLocation && <MapMarker position={myLocation} />}
      </Map>

      {/* 단순 현위치 버튼 */}
      <div className="absolute right-4 bottom-32 z-10">
        <button 
          onClick={moveToMyLocation}
          className="w-[48px] h-[48px] bg-white border border-gray-300 rounded-full shadow-xl flex items-center justify-center active:scale-90 text-gray-800"
        >
          <Target size={24} />
        </button>
      </div>

      <style>{`
        .kakao-dark-theme { filter: invert(100%) hue-rotate(180deg) brightness(0.9) grayscale(0.2); background-color: #fff !important; }
        .kakao-dark-theme img { filter: none !important; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
};

export default Main;
