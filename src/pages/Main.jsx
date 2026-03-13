import React, { useState, useEffect, useRef } from 'react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Target } from 'lucide-react';

/**
 * [Page] 메인 페이지 (현위치 전용 미니멀 버전)
 * @version 7.2.0
 * @author Antigravity
 * @description 
 * - 사용자의 요청에 따라 줌 컨트롤, 지도 타입 컨트롤을 모두 삭제했습니다.
 * - 오직 '현위치' 버튼만 우측 하단에 유지합니다.
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
          m.setMaxLevel(11);
          window.kakao.maps.event.addListener(m, 'dragstart', () => setIsFollowing(false));
        }}
        style={{ width: '100%', height: '100%' }}
        className={isDark ? 'kakao-dark-theme' : ''}
      >
        {myLocation && (
          <MapMarker position={myLocation} />
        )}
      </Map>

      {/* 현위치 버튼만 유지 */}
      <div className="absolute right-4 bottom-32 z-10">
        <button 
          onClick={moveToMyLocation}
          className={`w-[42px] h-[42px] bg-white border border-gray-300 rounded-lg shadow-lg flex items-center justify-center active:bg-gray-100 transition-all
            ${isFollowing ? 'text-blue-500' : 'text-gray-700'}
          `}
          title="현위치"
        >
          <Target size={24} fill={isFollowing ? "currentColor" : "none"} />
        </button>
      </div>

      <style>{`
        .kakao-dark-theme { 
          filter: invert(100%) hue-rotate(180deg) brightness(0.9) grayscale(0.2); 
          background-color: #fff !important; 
        }
        .kakao-dark-theme img { filter: none !important; }
        .kakao-dark-theme .kakao-logo, .kakao-dark-theme .kakao-copyright { filter: invert(100%) hue-rotate(180deg) !important; opacity: 0.4; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
};

export default Main;
