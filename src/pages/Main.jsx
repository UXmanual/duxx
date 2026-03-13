import React, { useState, useEffect, useRef } from 'react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Crosshair } from 'lucide-react';

/**
 * [Page] 메인 페이지 (모바일 마커 가시성 개선 버전)
 * @version 9.7.0
 * @author Antigravity
 * @description 
 * - 모바일에서 마커가 안 보이는 문제를 해결하기 위해 다크모드 역반전 필터를 적용했습니다.
 * - MapMarker 내부에 커스텀 UI를 배치하여 모바일 렌더링 안정성을 높였습니다.
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
        null, // 초기 진입 에러는 무시
        { 
          enableHighAccuracy: true, 
          timeout: 10000, // 모바일 GPS 수신 대기시간 연장
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
        {/* 모바일 가시성 개선 커스텀 마커 */}
        {myLocation && (
          <MapMarker 
            position={myLocation} 
            zIndex={1000}
          >
            <div className={`relative flex items-center justify-center pointer-events-none ${isDark ? 'custom-marker-invert' : ''}`}>
              {/* 펄스 파동 (사이즈/투명도 최적화) */}
              <div className="absolute w-8 h-8 bg-[#FF4D00] rounded-full animate-ping opacity-30" />
              
              {/* 픽셀 퍼펙트 마커 소체 (24px) */}
              <div className="relative w-[24px] h-[24px] bg-[#FF4D00] border-2 border-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                <div className="w-[6px] h-[6px] bg-white rounded-full" />
              </div>
            </div>
          </MapMarker>
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
        
        /* 다크모드에서 주황색 마커가 반전되지 않도록 재반전 */
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
