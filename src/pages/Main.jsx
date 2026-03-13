import React, { useState, useEffect, useRef } from 'react';
import { Map, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Crosshair } from 'lucide-react';

/**
 * [Page] 메인 페이지 (마커 센터링 정밀 수정 버전)
 * @version 9.1.0
 * @author Antigravity
 * @description 
 * - 현위치 마커의 중앙 흰색 점이 어긋나 보이던 문제를 픽셀 정렬(Pixel Alignment)을 통해 해결했습니다.
 * - xAnchor, yAnchor를 0.5로 설정하여 맵 좌표와 마커 중심을 완벽히 일치시켰습니다.
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
        {/* 현위치 마커 (픽셀 완벽 센터링) */}
        {myLocation && (
          <CustomOverlayMap 
            position={myLocation} 
            zIndex={999}
            xAnchor={0.5}
            yAnchor={0.5}
          >
            <div className="flex items-center justify-center pointer-events-none">
              <div className="w-[24px] h-[24px] bg-[#FF4D00] border-2 border-white rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
                {/* 짝수 사이즈(24px)에 맞춰 흰색 점도 짝수(6px)로 조정하여 1px 오차 차단 */}
                <div className="w-[6px] h-[6px] bg-white rounded-full" />
              </div>
            </div>
          </CustomOverlayMap>
        )}
      </Map>

      {/* 테마 대응 현위치 버튼 */}
      <div className="fixed right-6 bottom-32 z-[9999]">
        <button 
          onPointerDown={handleMyLocation}
          className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center active:scale-90 transition-all border
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
