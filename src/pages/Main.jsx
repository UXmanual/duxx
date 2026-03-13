import React, { useState, useEffect, useRef } from 'react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Target } from 'lucide-react';

/**
 * [Page] 메인 페이지 (모바일 터치 완전 복구 버전)
 * @version 8.2.0
 * @author Antigravity
 * @description 
 * - 모바일에서 버튼이 반응하지 않던 문제를 해결하기 위해 고정(fixed) 위치와 최상위 z-index를 적용했습니다.
 * - 카카오맵 초기 연동 시의 가장 안정적인 가이드 코드를 기반으로 재구성했습니다.
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
    // 이벤트 전파 방지 (모바일 터치 씹힘 방지)
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

  // 모바일 레이아웃 보정
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

      {/* 모바일에서 가장 확실하게 반응하는 fixed 위치 및 z-index 세팅 */}
      <div className="fixed right-6 bottom-32 z-[9999]">
        <button 
          onPointerDown={handleMyLocation} // onClick보다 모바일에서 더 즉각적인 반응을 주는 이벤트
          className="w-14 h-14 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center justify-center active:scale-95 text-gray-800 touch-none pointer-events-auto"
          style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
          aria-label="현위치"
        >
          <Target size={28} />
        </button>
      </div>

      <style>{`
        .kakao-dark-theme { filter: invert(100%) hue-rotate(180deg) brightness(0.9); background-color: #fff !important; }
        .kakao-dark-theme img { filter: none !important; }
        
        /* 모바일 브라우저 하단 바 등에 가려지는 현상 방지 */
        @media (max-width: 640px) {
          .kakao-copyright, .kakao-logo { visibility: hidden; }
        }
      `}</style>
    </div>
  );
};

export default Main;
