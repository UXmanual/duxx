import React, { useState, useEffect, useRef } from 'react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Target } from 'lucide-react';

/**
 * [Page] 메인 페이지 (위치 권한 인식 오류 수정 버전)
 * @version 7.3.0
 * @author Antigravity
 * @description 
 * - 권한 허용 후에도 알럿이 계속 뜨는 현상을 방지하기 위해 Timeout을 15초로 상향했습니다.
 * - PERMISSION_DENIED(1) 에러가 명확할 때만 시스템 알럿을 띄우도록 로직을 정교화했습니다.
 */

const Main = () => {
  const { isDark } = useTheme();
  const mapRef = useRef(null);
  const [myLocation, setMyLocation] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const isRequesting = useRef(false);

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAPS_API_KEY,
    libraries: ['services', 'clusterer', 'drawing'],
  });

  const moveToMyLocation = () => {
    if (!navigator.geolocation || isRequesting.current) return;

    isRequesting.current = true;
    
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,   // 대기 시간을 15초로 상향하여 가짜 거부 방지
      maximumAge: 30000 // 30초 이내의 이전 위치 정보 허용으로 안정성 확보
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        isRequesting.current = false;
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
        isRequesting.current = false;
        console.error("Geolocation Error:", err);
        
        // 사용자가 명시적으로 '거부'를 눌렀을 때만 알럿 표시
        if (err.code === 1) {
          alert("위치 권한이 거부되었습니다. 원활한 서비를 위해 브라우저 설정에서 위치 권한을 허용해 주세요.");
        } 
        // code 2(사용 불가)나 code 3(시간 초과)은 알럿 없이 조용히 종료 (모바일 GPS 특성 고려)
      },
      options
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
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isFollowing]);

  if (loading) return null;

  return (
    <div className="w-full h-screen relative bg-white overflow-hidden">
      <Map
        center={{ lat: 37.5665, lng: 126.9780 }}
        level={4}
        onCreate={(m) => {
          mapRef.current = m;
          m.setMaxLevel(11);
          window.kakao.maps.event.addListener(m, 'dragstart', () => setIsFollowing(false));
          setTimeout(() => m.relayout(), 100);
        }}
        style={{ width: '100%', height: '100%' }}
        className={isDark ? 'kakao-dark-theme' : ''}
      >
        {myLocation && (
          <MapMarker position={myLocation} />
        )}
      </Map>

      {/* 현위치 버튼 */}
      <div className="absolute right-4 bottom-32 z-10">
        <button 
          onClick={moveToMyLocation}
          className={`w-[42px] h-[42px] bg-white border border-gray-300 rounded-lg shadow-lg flex items-center justify-center active:scale-95 transition-all
            ${isFollowing ? 'text-blue-500 border-blue-200' : 'text-gray-700'}
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
