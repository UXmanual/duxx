import React, { useState, useEffect, useRef } from 'react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Crosshair } from 'lucide-react';

/**
 * [Page] 메인 페이지 (커스텀 디자인 버튼 적용 버전)
 * @version 8.3.0
 * @author Antigravity
 * @description 
 * - 사용자가 제공한 이미지의 디자인(다크 서클 + 화이트 크로스헤어)으로 현위치 버튼을 변경했습니다.
 * - 버튼 사이즈를 컴팩트하게 축소하고, 모바일에서의 반응성을 유지합니다.
 */

const Main = () => {
  const { isDark } = useTheme();
  const [map, setMap] = useState(null);
  const [myLocation, setMyLocation] = useState(null);

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAPS_API_KEY,
    libraries: ['services', 'clusterer', 'drawing'],
  });

  const handleMyLocation = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMyLocation({ lat, lng });
          if (map) {
            map.panTo(new window.kakao.maps.LatLng(lat, lng));
            map.setLevel(4);
          }
        },
        (err) => {
          if (err.code === 1) alert("위치 권한을 허용해 주세요.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  useEffect(() => {
    if (map) {
      setTimeout(() => map.relayout(), 100);
    }
  }, [map]);

  if (loading) return null;

  return (
    <div className="w-full h-screen relative bg-white">
      <Map
        center={{ lat: 37.5665, lng: 126.9780 }}
        level={4}
        onCreate={setMap}
        style={{ width: '100%', height: '100%' }}
        className={isDark ? 'kakao-dark-theme' : ''}
      >
        {myLocation && <MapMarker position={myLocation} />}
      </Map>

      {/* 커스텀 디자인 현위치 버튼 (이미지 가이드 반영) */}
      <div className="fixed right-6 bottom-32 z-[9999]">
        <button 
          onPointerDown={handleMyLocation}
          className="w-10 h-10 bg-[#1a1c1e]/90 rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all border border-white/10"
          style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
          aria-label="현위치"
        >
          <Crosshair size={22} className="text-white" strokeWidth={1.5} />
        </button>
      </div>

      <style>{`
        .kakao-dark-theme { filter: invert(100%) hue-rotate(180deg) brightness(0.9); background-color: #fff !important; }
        .kakao-dark-theme img { filter: none !important; }
        @media (max-width: 640px) {
          .kakao-copyright, .kakao-logo { visibility: hidden; }
        }
      `}</style>
    </div>
  );
};

export default Main;
