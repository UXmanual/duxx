import React, { useState, useEffect, useRef } from 'react';
import { Map, MapMarker, ZoomControl, MapTypeControl, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Target } from 'lucide-react';

/**
 * [Page] 메인 페이지 (카카오 공식 컨트롤 통합 버전)
 * @version 7.1.0
 * @author Antigravity
 * @description 
 * - 모든 커스텀 UI를 삭제하고 카카오맵 SDK 표준 컨트롤(ZoomControl)을 적용했습니다.
 * - '현위치' 버튼은 카카오맵 공식 디자인 가이드를 준수하여 최소화된 형태로 구현했습니다.
 */

const Main = () => {
  const { isDark } = useTheme();
  const mapRef = useRef(null);
  const [myLocation, setMyLocation] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAPS_API_KEY,
    libraries: ['services', 'clusterer', 'drawing'],
  });

  // 현위치 이동 로직 (엔진 직결)
  const moveToMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const latlng = new window.kakao.maps.LatLng(latitude, longitude);
        if (mapRef.current) {
          mapRef.current.panTo(latlng);
          mapRef.current.setLevel(4);
        }
        setMyLocation({ lat: latitude, lng: longitude });
        setIsFollowing(true);
      },
      (err) => {
        if (err.code === 1) alert("위치 권한을 허용해 주세요.");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  useEffect(() => {
    if (!navigator.geolocation || !isFollowing) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMyLocation({ lat: latitude, lng: longitude });
        if (mapRef.current) mapRef.current.panTo(new window.kakao.maps.LatLng(latitude, longitude));
      },
      null,
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isFollowing]);

  if (loading) return null;

  return (
    <div className="w-full h-screen relative bg-white">
      <Map
        center={{ lat: 37.5665, lng: 126.9780 }}
        level={4}
        onCreate={(m) => {
          mapRef.current = m;
          // 최대 줌아웃 제한
          m.setMaxLevel(11);
          // 드래그 시 추적 해제
          window.kakao.maps.event.addListener(m, 'dragstart', () => setIsFollowing(false));
        }}
        style={{ width: '100%', height: '100%' }}
        className={isDark ? 'kakao-dark-theme' : ''}
      >
        {/* 카카오 공식 줌 컨트롤 */}
        <ZoomControl position={window.kakao.maps.ControlPosition.RIGHT} />
        
        {/* 카카오 공식 지도 타입 컨트롤 */}
        <MapTypeControl position={window.kakao.maps.ControlPosition.TOPRIGHT} />

        {myLocation && (
          <MapMarker position={myLocation} />
        )}
      </Map>

      {/* 공식 스타일 현위치 버튼 (카카오맵 표준 디자인 모사) */}
      <div className="absolute right-[11px] bottom-[110px] z-10">
        <button 
          onClick={moveToMyLocation}
          className={`w-[36px] h-[36px] bg-white border border-gray-300 rounded shadow-sm flex items-center justify-center active:bg-gray-100 transition-colors
            ${isFollowing ? 'text-blue-500' : 'text-gray-700'}
          `}
          title="현위치"
        >
          <Target size={20} fill={isFollowing ? "currentColor" : "none"} />
        </button>
      </div>

      <style>{`
        .kakao-dark-theme { 
          filter: invert(100%) hue-rotate(180deg) brightness(0.9) grayscale(0.2); 
          background-color: #fff !important; 
        }
        /* 다크모드 시 마커/로고 속성 보호 */
        .kakao-dark-theme img { filter: none !important; }
        .kakao-dark-theme .kakao-logo, .kakao-dark-theme .kakao-copyright { filter: invert(100%) hue-rotate(180deg) !important; opacity: 0.4; }
        
        /* 모바일에서 불필요한 레이아웃 보정 */
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
};

export default Main;
