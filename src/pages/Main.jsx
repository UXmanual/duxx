import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Compass, Plus, Minus, Target, Navigation2 } from 'lucide-react';

/**
 * [Page] 메인 페이지 (iOS/모바일 실기기 완전 대응 버전)
 * @version 6.1.0
 * @author Antigravity
 * @description 
 * - iOS Safari에서 Geolocation 권한 요청 및 마커 렌더링 문제를 해결했습니다.
 * - 지도의 다크 테두리 필터가 모바일에서 마커를 가리는 현상을 방지하기 위해 스타일을 조정했습니다.
 * - 버튼 클릭 시 즉각적인 피드백을 강화했습니다.
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

  // 한반도 영역 가두기
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

    if (isOutOfRange) {
      mapInstance.setCenter(new window.kakao.maps.LatLng(targetLat, targetLng));
    }
  }, []);

  // 위치 요청 및 지도 반영 통합 로직
  const fetchAndApplyLocation = useCallback((shouldAnimate = true) => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const pos = { lat: latitude, lng: longitude };
        setMyLocation(pos);
        
        if (map) {
          const latlng = new window.kakao.maps.LatLng(latitude, longitude);
          if (shouldAnimate) {
            map.panTo(latlng);
            setTimeout(() => {
                if (map.getLevel() !== 4) map.setLevel(4, { animate: true });
            }, 300);
          } else {
            map.setCenter(latlng);
            map.setLevel(4);
          }
          setIsFollowing(true);
        }
      },
      (err) => {
        console.warn("Location error:", err);
        // iOS에서 최초 거부 후 버튼 클릭 시 안내를 위해 alert는 최소화합니다.
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [map]);

  // 초기 로드 시 현위치 시도
  useEffect(() => {
    if (map && !isInitialSet.current) {
        fetchAndApplyLocation(false);
        isInitialSet.current = true;
        // 모바일 브레이크 방지를 위한 강제 리아웃
        setTimeout(() => map.relayout(), 100);
    }
  }, [map, fetchAndApplyLocation]);

  // 실시간 위치 추적 (Background)
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMyLocation({ lat: latitude, lng: longitude });
        if (isFollowing && map) {
          map.panTo(new window.kakao.maps.LatLng(latitude, longitude));
        }
      },
      null,
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, isFollowing]);

  const zoomIn = () => map?.setLevel(map.getLevel() - 1, { animate: true });
  const zoomOut = () => {
    if (map && map.getLevel() < 11) map.setLevel(map.getLevel() + 1, { animate: true });
  };

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
        onTileLoaded={(m) => m.setMaxLevel(11)}
        className={isDark ? 'kakao-dark-theme' : ''}
      >
        {/* iOS 실기기에서 마커 유실 방지를 위해 CustomOverlay 옵션 최적화 */}
        {myLocation && (
          <CustomOverlayMap 
            position={myLocation} 
            zIndex={100} 
            clickable={false}
          >
            <div className="relative flex items-center justify-center pointer-events-none">
              <div className="absolute w-20 h-20 bg-blue-500/20 rounded-full animate-ping"></div>
              <div className="absolute w-12 h-12 bg-blue-400/30 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
              <div className="relative w-7 h-7 bg-blue-600 rounded-full border-[3px] border-white shadow-[0_0_20px_rgba(37,99,235,1)] flex items-center justify-center">
                <Navigation2 size={14} className="text-white fill-current" />
              </div>
            </div>
          </CustomOverlayMap>
        )}
      </Map>

      {/* Control Panel (터치 지연 방지를 위해 active 스타일과 pointer-events 최적화) */}
      <div className="absolute right-6 bottom-32 sm:right-8 sm:top-1/2 sm:-translate-y-1/2 z-50 flex flex-col gap-5">
        <div className="flex flex-col bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[28px] overflow-hidden shadow-2xl pointer-events-auto">
          <button 
            onClick={zoomIn} 
            className="p-6 sm:p-5 hover:bg-white/10 border-b border-white/5 text-white active:bg-blue-500/20 transition-all touch-manipulation"
          >
            <Plus size={28} className="sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={zoomOut} 
            className="p-6 sm:p-5 hover:bg-white/10 text-white active:bg-blue-500/20 transition-all touch-manipulation"
          >
            <Minus size={28} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        <button 
          onClick={() => fetchAndApplyLocation(true)} 
          className={`p-6 sm:p-5 rounded-full backdrop-blur-3xl border transition-all duration-500 shadow-2xl flex items-center justify-center pointer-events-auto touch-manipulation
            ${isFollowing ? 'bg-blue-600 border-blue-400 text-white animate-pulse' : 'bg-black/60 border-white/10 text-white/80'}
          `}
        >
          <Target size={32} className="sm:w-6 sm:h-6" />
        </button>
      </div>

      <style>{`
        .kakao-dark-theme { 
            filter: invert(100%) hue-rotate(180deg) brightness(0.95) contrast(1.1) grayscale(0.1); 
            background-color: #05070a !important; 
        }
        /* Safari에서 필터 적용 시 겹침 현상 방지 */
        .kakao-dark-theme img {
            -webkit-user-drag: none;
            -webkit-user-select: none;
        }
        .kakao-dark-theme img[src*="dapi.kakao.com"] { filter: none !important; }
        .kakao-dark-theme .kakao-copyright, .kakao-dark-theme .kakao-logo { filter: invert(100%) hue-rotate(180deg) !important; opacity: 0.3; }
        
        .touch-manipulation {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        }

        @media (max-width: 640px) { 
          .kakao-copyright, .kakao-logo { display: none !important; } 
        }
      `}</style>
    </div>
  );
};

export default Main;
