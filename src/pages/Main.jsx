import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Compass, Plus, Minus, Target, Navigation2 } from 'lucide-react';

/**
 * [Page] 메인 페이지 (제로-레이턴시 위치 이동 버전)
 * @version 6.8.0
 * @author Antigravity
 * @description 
 * - 버튼 클릭 시 발생하는 모든 스피너, 로딩 상태, 불필요한 이벤트를 제거했습니다.
 * - 위치 요청과 동시에 지도를 이동시키며, 화면 버벅임(Jank)을 방지하기 위해 렌더링 부하를 최소화했습니다.
 * - 버튼 인터랙션을 순수 CSS 호버/액티브로만 처리하여 즉각적인 반응을 보장합니다.
 */

const containerStyle = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0
};

const KOREA_BOUNDS = {
  sw: { lat: 31.0, lng: 122.0 },
  ne: { lat: 41.0, lng: 133.0 }
};

const defaultCenter = { lat: 37.5665, lng: 126.9780 };

const Main = () => {
  const { isDark } = useTheme();
  const [map, setMap] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const isInitialSet = useRef(false);

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAPS_API_KEY,
    libraries: ['services', 'clusterer', 'drawing'],
  });

  const handleBoundsCheck = useCallback((mapInstance) => {
    if (!mapInstance) return;
    const center = mapInstance.getCenter();
    const lat = center.getLat();
    const lng = center.getLng();
    let targetLat = lat, targetLng = lng, isOutOfRange = false;

    if (lat < KOREA_BOUNDS.sw.lat) { targetLat = KOREA_BOUNDS.sw.lat; isOutOfRange = true; }
    if (lat > KOREA_BOUNDS.ne.lat) { targetLat = KOREA_BOUNDS.ne.lat; isOutOfRange = true; }
    if (lng < KOREA_BOUNDS.sw.lng) { targetLng = KOREA_BOUNDS.sw.lng; isOutOfRange = true; }
    if (lng > KOREA_BOUNDS.ne.lng) { targetLng = KOREA_BOUNDS.ne.lng; isOutOfRange = true; }

    if (isOutOfRange) mapInstance.setCenter(new window.kakao.maps.LatLng(targetLat, targetLng));
  }, []);

  // [Zero-Lag] 위치 이동 함수
  const moveToMyLocation = () => {
    if (!navigator.geolocation) return;

    // 위치 추적 상태로 즉시 변경 (버튼 색상 등 처리)
    setIsFollowing(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const pos = { lat: latitude, lng: longitude };
        setMyLocation(pos);
        
        if (map) {
          const latlng = new window.kakao.maps.LatLng(latitude, longitude);
          // 즉시 부드럽게 이동
          map.panTo(latlng);
          // 줌 레벨은 이동 완료 후 조용히 조절
          setTimeout(() => {
            if (map.getLevel() !== 4) map.setLevel(4, { animate: true });
          }, 300);
        }
      },
      (err) => {
        setIsFollowing(false);
        if (err.code === 1) alert("위치 권한을 허용해 주세요.");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  useEffect(() => {
    if (!myLocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMyLocation({ lat: latitude, lng: longitude });
        if (isFollowing && map) map.panTo(new window.kakao.maps.LatLng(latitude, longitude));
      },
      null,
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, isFollowing, myLocation]);

  useEffect(() => {
    if (map) setTimeout(() => map.relayout(), 100);
  }, [map]);

  if (loading) return <div className={`w-full h-screen ${isDark ? 'bg-[#05070a]' : 'bg-[#f4f7f9]'}`} />;

  return (
    <div className={`w-full h-screen relative overflow-hidden ${isDark ? 'bg-[#05070a]' : 'bg-[#f4f7f9]'}`}>
      <Map
        center={defaultCenter}
        level={4}
        onCreate={setMap}
        style={containerStyle}
        onDragStart={() => setIsFollowing(false)}
        onCenterChanged={handleBoundsCheck}
      >
        {myLocation && (
          <CustomOverlayMap position={myLocation} zIndex={999}>
            <div className="relative flex items-center justify-center pointer-events-none" style={{ transform: 'translate(0, -50%)' }}>
              <div className="absolute w-16 h-16 bg-blue-500/20 rounded-full animate-ping"></div>
              <div className="relative w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
                <Navigation2 size={12} className="text-white fill-current" />
              </div>
            </div>
          </CustomOverlayMap>
        )}
      </Map>

      {/* Control Panel (UI 최적화: Fixed & Layered) */}
      <div className="fixed right-6 bottom-32 sm:right-8 sm:top-1/2 sm:-translate-y-1/2 z-[1000] flex flex-col gap-5">
        
        {/* Zoom Controls */}
        <div className="flex flex-col bg-black/70 backdrop-blur-3xl border border-white/20 rounded-[28px] overflow-hidden shadow-2xl">
          <button 
            type="button" 
            onClick={() => map?.setLevel(map.getLevel() - 1, { animate: true })} 
            className="p-6 sm:p-5 text-white active:bg-white/20 border-b border-white/10 transition-colors"
          >
            <Plus size={24} className="sm:w-5 sm:h-5" />
          </button>
          <button 
            type="button" 
            onClick={() => { if (map?.getLevel() < 11) map?.setLevel(map.getLevel() + 1, { animate: true }); }} 
            className="p-6 sm:p-5 text-white/70 active:bg-white/20 transition-colors"
          >
            <Minus size={24} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        
        {/* Single Target Button (No Spinner, No Delay) */}
        <button 
          type="button"
          onClick={moveToMyLocation}
          className={`p-6 sm:p-6 rounded-full backdrop-blur-3xl border transition-all duration-300 shadow-2xl flex items-center justify-center active:scale-90
            ${isFollowing ? 'bg-blue-600 border-blue-400 text-white' : 'bg-black/70 border-white/20 text-white/80'}
          `}
        >
          <Target size={32} className="sm:w-8 sm:h-8" />
        </button>
      </div>

      <style>{`
        .kakao-dark-theme { 
            filter: invert(100%) hue-rotate(180deg) brightness(0.95) contrast(1.1) grayscale(0.1); 
            background-color: #05070a !important; 
        }
        .kakao-dark-theme img[src*="dapi.kakao.com"] { filter: none !important; }
        * { -webkit-tap-highlight-color: transparent; }
        button { touch-action: manipulation; }
      `}</style>
    </div>
  );
};

export default Main;
