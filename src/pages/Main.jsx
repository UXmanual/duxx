import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Compass, Plus, Minus, Target, Navigation2, Loader2 } from 'lucide-react';

/**
 * [Page] 메인 페이지 (수동 위치 권한 요청 버전)
 * @version 6.5.0
 * @author Antigravity
 * @description 
 * - 사이트 진입 시 자동으로 위치 정보를 요청하지 않습니다.
 * - 반드시 사용자가 '현위치 버튼'을 눌렀을 때만 권한을 체크하고 요청합니다.
 * - 권한 거부 시 시스템 고유의 Alert 창을 통해 안내합니다.
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

  // 실제 위치를 받아와서 지도를 이동시키는 공통 함수
  const fetchAndMove = useCallback((shouldAnimate = true) => {
    if (!navigator.geolocation) {
      alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const pos = { lat: latitude, lng: longitude };
        setMyLocation(pos);
        
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
        setIsFollowing(false);
        if (err.code === 1) {
          alert("위치 정보 권한이 거부되었습니다. 원활한 서비를 위해 설정에서 위치 권한을 허용해 주세요.");
        } else if (err.code === 2) {
          alert("위치 정보를 사용할 수 없습니다. GPS 연결을 확인해 주세요.");
        } else if (err.code === 3) {
          alert("위치 정보 요청 시간이 초과되었습니다.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [map]);

  const moveToMyLocation = useCallback(() => {
    // 버튼 클릭 시 권한 체크 및 요청 실행
    fetchAndMove(true);
  }, [fetchAndMove]);

  // 실시간 트래킹 (이미 권한이 있고 위치가 있을 때만 작동하도록 제한)
  useEffect(() => {
    if (!navigator.geolocation || !myLocation) return;
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

  if (loading) return <div className={`w-full h-screen ${isDark ? 'bg-[#05070a]' : 'bg-[#f4f7f9]'}`} />;

  return (
    <div className={`w-full h-screen relative overflow-hidden ${isDark ? 'bg-[#05070a]' : 'bg-[#f4f7f9]'}`}>
      <Map
        center={defaultCenter}
        level={4}
        onCreate={(m) => {
          setMap(m);
          m.setMaxLevel(11);
          setTimeout(() => m.relayout(), 100);
        }}
        style={containerStyle}
        onDragStart={() => setIsFollowing(false)}
        onCenterChanged={handleBoundsCheck}
        className={isDark ? 'kakao-dark-theme' : ''}
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

      {/* Control Panel */}
      <div className="fixed right-6 bottom-32 sm:right-8 sm:top-1/2 sm:-translate-y-1/2 z-[999] flex flex-col gap-6">
        <div className="flex flex-col bg-black/70 backdrop-blur-3xl border border-white/20 rounded-[24px] overflow-hidden shadow-2xl pointer-events-auto">
          <button type="button" onClick={(e) => { e.stopPropagation(); map?.setLevel(map.getLevel() - 1, { animate: true }); }} className="p-6 sm:p-4 text-white active:bg-white/20 border-b border-white/10"><Plus size={28} className="sm:w-6 sm:h-6" /></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); if (map?.getLevel() < 11) map?.setLevel(map.getLevel() + 1, { animate: true }); }} className="p-6 sm:p-4 text-white/70 active:bg-white/20"><Minus size={28} className="sm:w-6 sm:h-6" /></button>
        </div>
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); moveToMyLocation(); }}
          disabled={isLocating}
          className={`p-6 sm:p-5 rounded-full backdrop-blur-3xl border transition-all duration-300 shadow-2xl flex items-center justify-center pointer-events-auto active:scale-95
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
