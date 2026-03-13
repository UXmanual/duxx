import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Compass, Plus, Minus, Target, Navigation2, Loader2 } from 'lucide-react';

/**
 * [Page] 메인 페이지 (네이티브 프로프트 강제 활성화 버전)
 * @version 6.7.0
 * @author Antigravity
 * @description 
 * - iOS/Safari 등 모바일 브라우저에서 위치 권한 팝업(Native Prompt)이 반드시 뜨도록 호출 경로를 단순화했습니다.
 * - 브라우저의 '사용자 제스처(User Activation)' 유효 시간 내에 즉시 API를 호출하여 무시되는 현상을 방지합니다.
 * - maximumAge를 0으로 설정하여 캐시 대신 실시간 요청을 강제함으로써 시스템 팝업을 유도합니다.
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

  // 현위치 버튼 핸들러 (최대한 단순하게 클릭 직후 호출)
  const handleLocationRequest = (e) => {
    if (e) e.stopPropagation();
    
    if (!navigator.geolocation) {
      alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
      return;
    }

    setIsLocating(true);

    // [중요] 사용자의 클릭 이벤트 직후에 즉시 호출하여 브라우저가 '사용자 조작'으로 인식하게 함
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const pos = { lat: latitude, lng: longitude };
        setMyLocation(pos);
        
        if (map) {
          const latlng = new window.kakao.maps.LatLng(latitude, longitude);
          map.panTo(latlng);
          setTimeout(() => {
            if (map.getLevel() !== 4) map.setLevel(4, { animate: true });
          }, 300);
        }
        setIsFollowing(true);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setIsFollowing(false);
        
        console.warn("Geolocation Native Error:", err.code, err.message);

        // 에러 코드별 시스템 얼럿 출력
        if (err.code === 1) {
          alert("위치 정보 권한이 거부되었습니다.\n브라우저 설정에서 위치 권한을 '허용'으로 변경해주세요.");
        } else if (err.code === 2) {
          alert("위치 서비스를 사용할 수 없습니다.\n기기의 GPS가 켜져 있는지 확인해주세요.");
        } else if (err.code === 3) {
          alert("위치 요청 시간이 초과되었습니다.\n다시 시도해주세요.");
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 // 캐시를 사용하지 않아야 시스템 팝업 수신율이 높음
      }
    );
  };

  // 배경에서 위치 변화 감지 (권한이 이미 있는 경우에만)
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

  // 지도 초기 로드 시 레이아웃 갱신
  useEffect(() => {
    if (map) {
        setTimeout(() => map.relayout(), 100);
    }
  }, [map]);

  if (loading) return <div className={`w-full h-screen ${isDark ? 'bg-[#05070a]' : 'bg-[#f4f7f9]'}`} />;

  return (
    <div className={`w-full h-screen relative overflow-hidden ${isDark ? 'bg-[#05070a]' : 'bg-[#f4f7f9]'}`}>
      <Map
        center={defaultCenter}
        level={4}
        onCreate={(m) => {
          setMap(m);
          m.setMaxLevel(11);
        }}
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

      {/* Control Panel (Z-Index 최상위 유지) */}
      <div className="fixed right-6 bottom-32 sm:right-8 sm:top-1/2 sm:-translate-y-1/2 z-[1000] flex flex-col gap-6">
        <div className="flex flex-col bg-black/70 backdrop-blur-3xl border border-white/20 rounded-[28px] overflow-hidden shadow-2xl pointer-events-auto">
          <button type="button" onClick={(e) => { e.stopPropagation(); map?.setLevel(map.getLevel() - 1, { animate: true }); }} className="p-6 sm:p-5 text-white active:bg-white/20 border-b border-white/10"><Plus size={28} className="sm:w-6 sm:h-6" /></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); if (map?.getLevel() < 11) map?.setLevel(map.getLevel() + 1, { animate: true }); }} className="p-6 sm:p-5 text-white/70 active:bg-white/20"><Minus size={28} className="sm:w-6 sm:h-6" /></button>
        </div>
        
        <button 
          type="button"
          onClick={handleLocationRequest}
          disabled={isLocating}
          className={`p-6 sm:p-6 rounded-full backdrop-blur-3xl border transition-all duration-300 shadow-2xl flex items-center justify-center pointer-events-auto active:scale-90
            ${isLocating ? 'bg-amber-500 border-amber-300 text-white' : isFollowing ? 'bg-blue-600 border-blue-400 text-white animate-pulse' : 'bg-black/70 border-white/20 text-white/80'}
          `}
        >
          {isLocating ? <Loader2 size={32} className="animate-spin sm:w-8 sm:h-8" /> : <Target size={32} className="sm:w-8 sm:h-8" />}
        </button>
      </div>

      <style>{`
        .kakao-dark-theme { filter: invert(100%) hue-rotate(180deg) brightness(0.95) contrast(1.1) grayscale(0.1); background-color: #05070a !important; }
        .kakao-dark-theme img[src*="dapi.kakao.com"] { filter: none !important; }
        @media (max-width: 640px) { .kakao-copyright, .kakao-logo { display: none !important; } }
        * { -webkit-tap-highlight-color: transparent; }
        button { touch-action: manipulation; }
      `}</style>
    </div>
  );
};

export default Main;
