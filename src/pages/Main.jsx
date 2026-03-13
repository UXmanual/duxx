import React, { useState, useEffect, useRef } from 'react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Target } from 'lucide-react';

/**
 * [Page] 메인 페이지 (iOS Safari 위치 인식 최적화 버전)
 * @version 7.4.0
 * @author Antigravity
 * @description 
 * - iOS Safari에서 허용 후에도 즉시 거부되는 현상을 잡기 위해 enableHighAccuracy 옵션을 조정했습니다.
 * - 에러 발생 시 시스템 메시지를 그대로 노출하여 정확한 원인 파악을 돕습니다.
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

  const handleLocationRequest = (e) => {
    if (e) e.stopPropagation();
    
    if (!navigator.geolocation) {
      alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
      return;
    }

    // iOS Safari 대응: 사용자의 클릭 이벤트와 최대한 가까운 시점에 호출
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
        setIsFollowing(false);
        console.error("Native GeoError:", err);
        
        // 상세 에러 원인 파악을 위한 메시지 구성
        let msg = "위치 정보를 가져올 수 없습니다.\n";
        if (err.code === 1) msg = "권한이 거부되었습니다. (Safari 설정에서 위치 권한을 확인해주세요.)\n";
        else if (err.code === 2) msg = "위치 정보를 사용할 수 없습니다. (신호 약함)\n";
        else if (err.code === 3) msg = "요청 시간이 초과되었습니다.\n";
        
        // Safari 원문 에러 메시지를 포함하여 정확한 진단 유도
        alert(`${msg}\n[Detail]: ${err.message}`);
      },
      { 
        enableHighAccuracy: false, // iOS Safari 버그 대응: 일부 환경에서 true 시 즉시 거부될 수 있음
        timeout: 10000,
        maximumAge: 0 
      }
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
      { enableHighAccuracy: false }
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
        {myLocation && <MapMarker position={myLocation} />}
      </Map>

      <div className="absolute right-4 bottom-32 z-10">
        <button 
          onClick={handleLocationRequest}
          className={`w-[42px] h-[42px] bg-white border border-gray-300 rounded-lg shadow-lg flex items-center justify-center active:scale-95 transition-all
            ${isFollowing ? 'text-blue-500 border-blue-200 font-bold' : 'text-gray-700'}
          `}
        >
          <Target size={24} fill={isFollowing ? "currentColor" : "none"} />
        </button>
      </div>

      <style>{`
        .kakao-dark-theme { filter: invert(100%) hue-rotate(180deg) brightness(0.9) grayscale(0.2); background-color: #fff !important; }
        .kakao-dark-theme img { filter: none !important; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
};

export default Main;
