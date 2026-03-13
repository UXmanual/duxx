import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Compass, Plus, Minus, Target, Navigation2 } from 'lucide-react';

/**
 * [Page] 메인 페이지 (네이티브 위치 시스템 복구 버전)
 * @version 5.9.0
 * @author Antigravity
 * @description 
 * - 커스텀 가이드 팝업을 전면 삭제하고 브라우저/OS 고유의 위치 권한 시스템(Native Prompt)을 사용합니다.
 * - 버튼 클릭 시마다 위치 권한이 없는 경우 시스템에 요청을 보냅니다.
 * - 초기 로드 시 현위치 기반 화면 구성을 우선합니다.
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
  ne: { lat: 40.5, lng: 134.0 }
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

  // 위치 요청 함수 (시스템 팝업 유도)
  const requestLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const pos = { lat: latitude, lng: longitude };
          setMyLocation(pos);
          if (map) {
            map.panTo(new window.kakao.maps.LatLng(latitude, longitude));
            setTimeout(() => map.setLevel(4, { animate: true }), 300);
            setIsFollowing(true);
          }
        },
        (err) => {
          console.warn("Native Geolocation Error:", err);
          // 시스템 팝업을 통해 권한을 거부한 경우 다시 호출해도 브라우저가 팝업을 띄우지 않을 수 있습니다.
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [map]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const pos = { lat: latitude, lng: longitude };
        setMyLocation(pos);
        if (map && !isInitialSet.current) {
          map.setCenter(new window.kakao.maps.LatLng(latitude, longitude));
          map.setLevel(4);
          isInitialSet.current = true;
        }
        if (isFollowing && map) map.panTo(new window.kakao.maps.LatLng(latitude, longitude));
      },
      (err) => console.warn("WatchPosition Error:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, isFollowing]);

  const zoomIn = () => map?.setLevel(map.getLevel() - 1, { animate: true });
  const zoomOut = () => {
    if (map && map.getLevel() < 11) map.setLevel(map.getLevel() + 1, { animate: true });
  };

  const moveToMyLocation = useCallback(() => {
    if (myLocation && map) {
      map.panTo(new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng));
      setTimeout(() => map.setLevel(4, { animate: true }), 300);
      setIsFollowing(true);
    } else {
      requestLocation(); // 위치 정보가 아직 없으면 네이티브 팝업 요청
    }
  }, [myLocation, map, requestLocation]);

  if (loading) return <div className={`w-full h-screen ${isDark ? 'bg-[#05070a]' : 'bg-[#f4f7f9]'}`} />;

  return (
    <div className={`w-full h-screen relative overflow-hidden ${isDark ? 'bg-[#05070a]' : 'bg-[#f4f7f9]'}`}>
      <Map
        center={defaultCenter}
        level={4}
        onCreate={(m) => { setMap(m); m.setMaxLevel(11); }}
        style={containerStyle}
        onDragStart={() => setIsFollowing(false)}
        onCenterChanged={handleBoundsCheck}
        className={isDark ? 'kakao-dark-theme' : ''}
      >
        {myLocation && (
          <CustomOverlayMap position={myLocation} zIndex={3}>
            <div className="relative flex items-center justify-center p-4">
              <div className="absolute w-16 h-16 bg-blue-500 rounded-full animate-ping opacity-20"></div>
              <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-[0_0_20px_rgba(37,99,235,1)] flex items-center justify-center">
                <Navigation2 size={12} className="text-white fill-current" />
              </div>
            </div>
          </CustomOverlayMap>
        )}
      </Map>

      {/* Control Panel */}
      <div className="absolute right-6 bottom-28 sm:right-8 sm:top-1/2 sm:-translate-y-1/2 z-20 flex flex-col gap-4 pointer-events-none">
        <div className="flex flex-col bg-black/50 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto">
          <button onClick={zoomIn} className="p-5 sm:p-4 hover:bg-white/10 border-b border-white/5 text-white active:scale-95"><Plus size={24} className="sm:w-5 sm:h-5" /></button>
          <button onClick={zoomOut} className="p-5 sm:p-4 hover:bg-white/10 text-white/70 active:scale-95"><Minus size={24} className="sm:w-5 sm:h-5" /></button>
        </div>
        <button onClick={moveToMyLocation} className={`p-5 sm:p-4 rounded-full backdrop-blur-3xl border transition-all duration-500 shadow-2xl flex items-center justify-center pointer-events-auto active:scale-90 ${isFollowing ? 'bg-blue-600 border-blue-400 text-white animate-pulse' : 'bg-black/50 border-white/10 text-white/70 hover:text-white'}`}><Target size={28} className="sm:w-6 sm:h-6" /></button>
      </div>

      <style>{`
        .kakao-dark-theme { filter: invert(100%) hue-rotate(180deg) brightness(0.95) contrast(1.1) grayscale(0.1); background-color: #05070a !important; }
        .kakao-dark-theme img[src*="dapi.kakao.com"] { filter: none !important; }
        .kakao-dark-theme .kakao-copyright, .kakao-dark-theme .kakao-logo { filter: invert(100%) hue-rotate(180deg) !important; opacity: 0.3; }
        @media (max-width: 640px) { .kakao-copyright, .kakao-logo { transform: scale(0.8); transform-origin: bottom right; } }
      `}</style>
    </div>
  );
};

export default Main;
