import React, { useState, useEffect, useRef } from 'react';
import { Map, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Crosshair } from 'lucide-react';

/**
 * [Page] 메인 페이지 (커스텀 마커 복원 및 모바일 가시성 최종 버전)
 * @version 9.8.0
 * @author Antigravity
 * @description 
 * - 기본 마커 포인터를 제거하고 사용자가 직접 디자인한 '오렌지 원형 마커'를 복원했습니다.
 * - 다크모드 필터 재반전을 통해 모바일/다크모드에서도 마커 색상이 깨지지 않도록 해결했습니다.
 */

const Main = () => {
  const { isDark } = useTheme();
  const [map, setMap] = useState(null);
  const [myLocation, setMyLocation] = useState(null);

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAPS_API_KEY,
    libraries: ['services', 'clusterer', 'drawing'],
  });

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
        null,
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 30000 
        }
      );
    }
  };

  useEffect(() => {
    if (map) {
      requestLocation(true);
    }
  }, [map]);

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
        {/* 복원된 사용지 정의 커스텀 마커 */}
        {myLocation && (
          <CustomOverlayMap 
            position={myLocation} 
            zIndex={999}
            xAnchor={0.5}
            yAnchor={0.5}
          >
            <div className={`relative flex items-center justify-center pointer-events-none ${isDark ? 'custom-marker-invert' : ''}`}>
              {/* 펄스 파동 (v9.4 조정을 유지) */}
              <div className="absolute w-8 h-8 bg-[#FF4D00] rounded-full animate-ping opacity-30" />
              
              {/* 사용자가 디자인한 마커 소체 (#FF4D00, 24px) */}
              <div className="relative w-[24px] h-[24px] bg-[#FF4D00] border-2 border-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                <div className="w-[6px] h-[6px] bg-white rounded-full" />
              </div>
            </div>
          </CustomOverlayMap>
        )}
      </Map>

      {/* [Footer Aligned] 테마 대응 현위치 버튼 */}
      <div className="fixed bottom-0 right-0 z-[9999] pointer-events-none">
        <div className="w-full px-10 py-8">
          <div className="py-5 flex items-center justify-end pointer-events-auto">
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
        </div>
      </div>

      <style>{`
        .kakao-dark-theme { filter: invert(100%) hue-rotate(180deg) brightness(0.9) grayscale(0.2); background-color: #fff !important; }
        .kakao-dark-theme img { filter: none !important; }
        
        /* 다크모드에서 주황색 마커가 반전되지 않도록 재반전 - 모바일 가시성 해결책 */
        .custom-marker-invert {
          filter: invert(100%) hue-rotate(180deg) !important;
        }

        @keyframes custom-ping {
          0% { transform: scale(0.8); opacity: 0.6; }
          70%, 100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-ping {
          animation: custom-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @media (max-width: 640px) {
          .kakao-copyright, .kakao-logo { visibility: hidden; }
        }
      `}</style>
    </div>
  );
};

export default Main;
