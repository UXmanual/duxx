import React, { useState, useEffect, useRef } from 'react';
import { Map, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Crosshair } from 'lucide-react';

/**
 * [Page] 메인 페이지 (초기 자동 위치 인식 버전)
 * @version 9.2.0
 * @author Antigravity
 * @description 
 * - 사이트 진입 시 자동으로 위치 정보를 확인하여 동의 시 현위치 마커를 표시합니다.
 * - 픽셀 퍼펙트 마커 디자인(#FF4D00, 24px)을 그대로 노출합니다.
 */

const Main = () => {
  const { isDark } = useTheme();
  const [map, setMap] = useState(null);
  const [myLocation, setMyLocation] = useState(null);

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAPS_API_KEY,
    libraries: ['services', 'clusterer', 'drawing'],
  });

  // 위치 정보를 가져와 지도를 이동시키는 공통 함수
  const requestLocation = (shouldPan = true) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const pos = { lat, lng };
          
          setMyLocation(pos);
          
          if (map && shouldPan) {
            map.setCenter(new window.kakao.maps.LatLng(lat, lng));
            map.setLevel(4);
          }
        },
        null, // 초기 진입 시에는 에러 알럿을 띄우지 않음 (사용자 경험 고려)
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  // 1. 사이트 초기 진입 시 자동 실행
  useEffect(() => {
    requestLocation(true);
  }, [map]); // map 인스턴스가 생성된 후 실행

  const handleMyLocationBtn = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    requestLocation(true);
  };

  if (loading) return null;

  return (
    <div className="w-full h-screen relative bg-white overflow-hidden">
      <Map
        center={{ lat: 37.5665, lng: 126.9780 }} // 위치 정보 확인 전 기본값
        level={4}
        onCreate={(m) => {
          setMap(m);
          m.setMaxLevel(11);
          setTimeout(() => m.relayout(), 100);
        }}
        style={{ width: '100%', height: '100%' }}
        className={isDark ? 'kakao-dark-theme' : ''}
      >
        {/* 현위치 마커 (자동 노출) */}
        {myLocation && (
          <CustomOverlayMap 
            position={myLocation} 
            zIndex={999}
            xAnchor={0.5}
            yAnchor={0.5}
          >
            <div className="flex items-center justify-center pointer-events-none">
              <div className="w-[24px] h-[24px] bg-[#FF4D00] border-2 border-white rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
                <div className="w-[6px] h-[6px] bg-white rounded-full" />
              </div>
            </div>
          </CustomOverlayMap>
        )}
      </Map>

      {/* 테마 대응 현위치 버튼 */}
      <div className="fixed right-6 bottom-32 z-[9999]">
        <button 
          onPointerDown={handleMyLocationBtn}
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
