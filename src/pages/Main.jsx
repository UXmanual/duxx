import React, { useState, useEffect, useRef } from 'react';
import { Map, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Crosshair } from 'lucide-react';

/**
 * [Page] 메인 페이지 (마커 디자인 고도화 버전)
 * @version 8.6.0
 * @author Antigravity
 * @description 
 * - 현위치 마커의 오렌지 컬러(#f57d00)를 불투명하게 변경하고 사이즈를 키웠습니다.
 * - 중앙 흰색 원과 대비를 강조하여 시인성을 높였습니다.
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
    <div className="w-full h-screen relative bg-white overflow-hidden">
      <Map
        center={{ lat: 37.5665, lng: 126.9780 }}
        level={4}
        onCreate={setMap}
        style={{ width: '100%', height: '100%' }}
        className={isDark ? 'kakao-dark-theme' : ''}
      >
        {/* 커스텀 오렌지 위치 마커 (불투명 + 사이즈 확대) */}
        {myLocation && (
          <CustomOverlayMap position={myLocation} zIndex={999}>
            <div className="flex items-center justify-center transform -translate-y-1/2 pointer-events-none">
              <div className="w-6 h-6 bg-[#f57d00] border-2 border-white rounded-full flex items-center justify-center shadow-[0_3px_12px_rgba(0,0,0,0.35)]">
                <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          </CustomOverlayMap>
        )}
      </Map>

      {/* 테마 대응 현위치 버튼 */}
      <div className="fixed right-6 bottom-32 z-[9999]">
        <button 
          onPointerDown={handleMyLocation}
          className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all border
            ${isDark 
              ? 'bg-[#1a1c1e]/90 border-white/10 text-white' 
              : 'bg-white border-gray-200 text-[#1a1c1e]'}
          `}
          style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
          aria-label="현위치"
        >
          <Crosshair size={22} strokeWidth={1.5} />
        </button>
      </div>

      <style>{`
        .kakao-dark-theme { filter: invert(100%) hue-rotate(180deg) brightness(0.9) grayscale(0.2); background-color: #fff !important; }
        .kakao-dark-theme img { filter: none !important; }
        @media (max-width: 640px) {
          .kakao-copyright, .kakao-logo { visibility: hidden; }
        }
      `}</style>
    </div>
  );
};

export default Main;
