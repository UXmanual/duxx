import React, { useState, useEffect, useRef } from 'react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Plus, Minus, Target } from 'lucide-react';

/**
 * [Page] 메인 페이지 (엔진 직결형 초고속 위치 이동 버전)
 * @version 7.0.0
 * @author Antigravity
 * @description 
 * - 리액트의 상태 관리(useState)가 지도 렌더링 스레드를 방해하여 발생하는 '프리징' 현상을 근본적으로 해결했습니다.
 * - Kakao Map API 인스턴스에 직접 접근(Native Imperative)하여 명령을 내리므로 드래그 전에도 즉시 이동합니다.
 * - 불필요한 이벤트 바인딩과 중복 호출을 모두 제거한 최경량 구조입니다.
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

  // [Native Direct] 위치 이동 및 지도 엔진 직접 제어
  const moveToMyLocation = () => {
    if (!navigator.geolocation) return;

    // 1. 시스템 위치 요청 (초경량)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const latlng = new window.kakao.maps.LatLng(latitude, longitude);
        
        // 2. 리액트 렌더링을 거치지 않고 지도 엔진에 즉시 이동 명령 (가장 중요)
        const mapInstance = mapRef.current;
        if (mapInstance) {
          mapInstance.panTo(latlng);
          mapInstance.setLevel(4); // 줌 애니메이션 제거로 프리징 차단
        }

        // 3. 마커 표시를 위한 상태 업데이트 (최소화)
        setMyLocation({ lat: latitude, lng: longitude });
        setIsFollowing(true);
      },
      (err) => {
        if (err.code === 1) alert("위치 권한을 허용해 주세요.");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // 실시간 추적 (동일한 직결 로직 적용)
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const pos = { lat: latitude, lng: longitude };
        
        if (isFollowing && mapRef.current) {
          mapRef.current.panTo(new window.kakao.maps.LatLng(latitude, longitude));
        }
        setMyLocation(pos);
      },
      null,
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isFollowing]);

  if (loading) return null;

  return (
    <div className="w-full h-screen relative bg-[#05070a]">
      <Map
        center={{ lat: 37.5665, lng: 126.9780 }}
        level={4}
        onCreate={(m) => {
          mapRef.current = m;
          m.setMaxLevel(11);
          // 드래그 시 추적 해제
          window.kakao.maps.event.addListener(m, 'dragstart', () => setIsFollowing(false));
        }}
        style={{ width: '100%', height: '100%' }}
        className={isDark ? 'kakao-dark-theme' : ''}
      >
        {myLocation && (
          <MapMarker position={myLocation} />
        )}
      </Map>

      {/* Control UI (최상위 단일 레이어 배치) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-5">
        <div className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl">
          <button 
            onClick={() => mapRef.current?.setLevel(mapRef.current.getLevel() - 1)}
            className="p-5 active:bg-gray-100 border-b border-gray-100"
          >
            <Plus size={24} className="text-gray-900" />
          </button>
          <button 
            onClick={() => { if (mapRef.current?.getLevel() < 11) mapRef.current.setLevel(mapRef.current.getLevel() + 1); }}
            className="p-5 active:bg-gray-100"
          >
            <Minus size={24} className="text-gray-600" />
          </button>
        </div>
        
        <button 
          onClick={moveToMyLocation}
          className={`p-5 rounded-full shadow-2xl transition-transform active:scale-95
            ${isFollowing ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border border-gray-200'}
          `}
        >
          <Target size={30} />
        </button>
      </div>

      <style>{`
        .kakao-dark-theme { filter: invert(100%) hue-rotate(180deg) brightness(0.9) grayscale(0.25); background-color: #05070a !important; }
        .kakao-dark-theme img { filter: none !important; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
};

export default Main;
