import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Plus, Minus, Target } from 'lucide-react';

/**
 * [Page] 메인 페이지 (네이티브 성능 최적화 버전)
 * @version 6.9.0
 * @author Antigravity
 * @description 
 * - 모든 '이상한 효과' (스피너, 오버레이 레이어, 복잡한 상태)를 완전히 제거했습니다.
 * - 버튼 클릭 시 어떠한 중간 단계 없이 즉시 시스템 위치 기능을 호출합니다.
 * - '한 번 더 클릭해야 움직이는' 문제를 해결하기 위해 이벤트 전파와 레이어 스택을 단순화했습니다.
 */

const Main = () => {
  const { isDark } = useTheme();
  const mapRef = useRef(null);
  const [myLocation, setMyLocation] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const isMoving = useRef(false); // 수동 이동 중 영역 체크 일시 정지용

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAPS_API_KEY,
    libraries: ['services', 'clusterer', 'drawing'],
  });

  // 한반도 영역 가두기 (최적화)
  const handleBoundsCheck = useCallback(() => {
    const map = mapRef.current;
    if (!map || isMoving.current) return;

    const KOREA_BOUNDS = {
      sw: { lat: 33.0, lng: 124.0 },
      ne: { lat: 39.0, lng: 132.0 }
    };

    const center = map.getCenter();
    const lat = center.getLat();
    const lng = center.getLng();
    let targetLat = lat, targetLng = lng, isOutOfRange = false;

    if (lat < KOREA_BOUNDS.sw.lat) { targetLat = KOREA_BOUNDS.sw.lat; isOutOfRange = true; }
    if (lat > KOREA_BOUNDS.ne.lat) { targetLat = KOREA_BOUNDS.ne.lat; isOutOfRange = true; }
    if (lng < KOREA_BOUNDS.sw.lng) { targetLng = KOREA_BOUNDS.sw.lng; isOutOfRange = true; }
    if (lng > KOREA_BOUNDS.ne.lng) { targetLng = KOREA_BOUNDS.ne.lng; isOutOfRange = true; }

    if (isOutOfRange) {
      map.setCenter(new window.kakao.maps.LatLng(targetLat, targetLng));
    }
  }, []);

  // 현위치 즉시 이동 (불필요한 효과 제거)
  const moveToMyLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const pos = { lat: latitude, lng: longitude };
        setMyLocation(pos);
        
        const map = mapRef.current;
        if (map) {
          isMoving.current = true;
          const latlng = new window.kakao.maps.LatLng(latitude, longitude);
          map.panTo(latlng);
          map.setLevel(4, { animate: true });
          setIsFollowing(true);
          
          // 이동 애니메이션 종료 후 영역 체크 재개
          setTimeout(() => { isMoving.current = false; }, 500);
        }
      },
      (err) => {
        if (err.code === 1) alert("위치 권한을 허용해 주세요.");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // 실시간 추적
  useEffect(() => {
    if (!navigator.geolocation || !myLocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const pos = { lat: latitude, lng: longitude };
        setMyLocation(pos);
        if (isFollowing && mapRef.current) {
          mapRef.current.panTo(new window.kakao.maps.LatLng(latitude, longitude));
        }
      },
      null,
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isFollowing, myLocation]);

  if (loading) return null;

  return (
    <div className="w-full h-screen relative bg-black">
      <Map
        center={{ lat: 37.5665, lng: 126.9780 }}
        level={4}
        onCreate={(m) => {
          mapRef.current = m;
          m.setMaxLevel(11);
        }}
        style={{ width: '100%', height: '100%' }}
        onDragStart={() => {
            setIsFollowing(false);
            isMoving.current = false;
        }}
        onCenterChanged={handleBoundsCheck}
        className={isDark ? 'kakao-dark-theme' : ''}
      >
        {myLocation && (
          <MapMarker 
            position={myLocation}
            image={{
                src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                size: { width: 24, height: 35 }
            }}
          />
        )}
      </Map>

      {/* Control UI (최대한 가볍게) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-4 pointer-events-none">
        <div className="flex flex-col bg-white/90 border border-gray-200 rounded-xl overflow-hidden shadow-lg pointer-events-auto">
          <button 
            onClick={() => mapRef.current?.setLevel(mapRef.current.getLevel() - 1, { animate: true })}
            className="p-4 hover:bg-gray-100 active:bg-gray-200 border-b border-gray-200 transition-colors"
          >
            <Plus size={20} className="text-gray-800" />
          </button>
          <button 
            onClick={() => { if (mapRef.current?.getLevel() < 11) mapRef.current.setLevel(mapRef.current.getLevel() + 1, { animate: true }); }}
            className="p-4 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <Minus size={20} className="text-gray-600" />
          </button>
        </div>
        <button 
          onClick={moveToMyLocation}
          className={`p-4 rounded-full shadow-xl pointer-events-auto transition-all active:scale-90
            ${isFollowing ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}
          `}
        >
          <Target size={24} />
        </button>
      </div>

      <style>{`
        .kakao-dark-theme { filter: invert(100%) hue-rotate(180deg) brightness(0.9) grayscale(0.2); background-color: #000 !important; }
        .kakao-dark-theme img { filter: none !important; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
};

export default Main;
