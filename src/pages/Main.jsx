import React, { useState, useEffect, useRef } from 'react';
import { Map, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Crosshair } from 'lucide-react';

/**
 * [Page] 메인 페이지 (현위치 펄스 애니메이션 버전)
 * @version 9.3.0
 * @author Antigravity
 * @description 
 * - 현위치 마커 주변에 은은하게 퍼져나가는 반투명 펄스(Pulse) 애니메이션을 추가했습니다.
 * - 시각적으로 '현재 위치'임을 더욱 명확하게 인지할 수 있도록 돕습니다.
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
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  useEffect(() => {
    requestLocation(true);
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
        {/* 현위치 마커 + 펄스 애니메이션 */}
        {myLocation && (
          <CustomOverlayMap 
            position={myLocation} 
            zIndex={999}
            xAnchor={0.5}
            yAnchor={0.5}
          >
            <div className="relative flex items-center justify-center pointer-events-none">
              {/* 바깥쪽 퍼져나가는 펄스 효과 */}
              <div className="absolute w-12 h-12 bg-[#FF4D00] rounded-full animate-ping opacity-20" />
              <div className="absolute w-10 h-10 bg-[#FF4D00] rounded-full animate-pulse opacity-10" />
              
              {/* 메인 마커 */}
              <div className="relative w-[24px] h-[24px] bg-[#FF4D00] border-2 border-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
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
        
        @keyframes custom-ping {
          0% { transform: scale(1); opacity: 0.4; }
          70%, 100% { transform: scale(2.5); opacity: 0; }
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
