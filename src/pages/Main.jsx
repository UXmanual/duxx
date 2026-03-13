import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Compass, Plus, Minus, Target, Navigation2, Loader2 } from 'lucide-react';

/**
 * [Page] 메인 페이지 (네이티브 위치 시스템 전용 버전)
 * @version 6.4.0
 * @author Antigravity
 * @description 
 * - 모든 종류의 커스텀 팝업과 알림(Alert)을 완전히 삭제했습니다.
 * - 오직 브라우저/OS의 네이티브 지오로케이션 기능만 사용하여 작동합니다.
 * - 버튼 클릭 시 즉각적인 로딩 피드백을 유지하며, 무음 응답(Silent fail) 방식으로 처리합니다.
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
  const [isLocating, setIsLocating] = useState(false);
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

  const fetchLocation = useCallback((shouldAnimate = true) => {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMyLocation({ lat: latitude, lng: longitude });
        if (map) {
          const latlng = new window.kakao.maps.LatLng(latitude, longitude);
          if (shouldAnimate) {
            map.panTo(latlng);
            setTimeout(() => map.setLevel(4, { animate: true }), 300);
          } else {
            map.setCenter(latlng);
            map.setLevel(4);
          }
        }
        setIsFollowing(true);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation Warning:", err.message);
        // 모든 팝업 및 알림 삭제 (사용자 요청)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [map]);

  useEffect(() => {
    if (map && !isInitialSet.current) {
      setTimeout(() => {
        fetchLocation(false);
        map.relayout();
      }, 500);
      isInitialSet.current = true;
    }
  }, [map, fetchLocation]);

  useEffect(() => {
    if (!navigator.geolocation) return;
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
  }, [map, isFollowing]);

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
              <div className="absolute w-20 h-20 bg-blue-500/20 rounded-full animate-ping"></div>
              <div className="relative w-7 h-7 bg-blue-600 rounded-full border-[3px] border-white shadow-2xl flex items-center justify-center">
                <Navigation2 size={14} className="text-white fill-current" />
              </div>
            </div>
          </CustomOverlayMap>
        )}
      </Map>

      {/* Control Panel (최상위 z-index 유지) */}
      <div className="fixed right-6 bottom-32 sm:right-8 sm:top-1/2 sm:-translate-y-1/2 z-[999] flex flex-col gap-6">
        <div className="flex flex-col bg-black/70 backdrop-blur-3xl border border-white/20 rounded-[24px] overflow-hidden shadow-2xl">
          <button type="button" onClick={(e) => { e.stopPropagation(); map?.setLevel(map.getLevel() - 1, { animate: true }); }} className="p-6 sm:p-4 text-white active:bg-white/20 border-b border-white/10"><Plus size={28} className="sm:w-6 sm:h-6" /></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); if (map?.getLevel() < 11) map?.setLevel(map.getLevel() + 1, { animate: true }); }} className="p-6 sm:p-4 text-white/70 active:bg-white/20"><Minus size={28} className="sm:w-6 sm:h-6" /></button>
        </div>
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); fetchLocation(true); }}
          disabled={isLocating}
          className={`p-6 sm:p-5 rounded-full backdrop-blur-3xl border transition-all duration-300 shadow-2xl flex items-center justify-center active:scale-90
            ${isLocating ? 'bg-amber-500 border-amber-300 text-white' : isFollowing ? 'bg-blue-600 border-blue-400 text-white animate-pulse' : 'bg-black/70 border-white/20 text-white/80'}
          `}
        >
          {isLocating ? <Loader2 size={32} className="animate-spin sm:w-7 sm:h-7" /> : <Target size={32} className="sm:w-7 sm:h-7" />}
        </button>
      </div>

      <style>{`
        .kakao-dark-theme { filter: invert(100%) hue-rotate(180deg) brightness(0.95) contrast(1.1) grayscale(0.1); background-color: #05070a !important; }
        .kakao-dark-theme img[src*="dapi.kakao.com"] { filter: none !important; }
        @media (max-width: 640px) { .kakao-copyright, .kakao-logo { display: none !important; } }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
};

export default Main;
