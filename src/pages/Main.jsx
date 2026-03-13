import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Compass, Plus, Minus, Target, Navigation2 } from 'lucide-react';

/**
 * [Page] 메인 페이지 (모바일 현위치 및 마커 복구 버전)
 * @version 6.0.0
 * @author Antigravity
 * @description 
 * - 모바일에서 마커가 보이지 않던 현상을 해결하기 위해 렌더링 구조를 개선했습니다.
 * - 현위치 버튼 클릭 시 시스템 권한 팝업이 확실히 호출되도록 로직을 일원화했습니다.
 * - 모바일 브라우저의 특성을 고려하여 지도 레이아웃과 좌표 이탈 방지 로직을 최적화했습니다.
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

  // 실제 위치를 지도로 반영하는 함수
  const applyLocationToMap = useCallback((lat, lng, shouldPan = true) => {
    if (!map) return;
    const latlng = new window.kakao.maps.LatLng(lat, lng);
    
    if (shouldPan) {
      map.panTo(latlng);
      // 부드러운 전환을 위해 약간의 지연 후 레벨 조절
      setTimeout(() => {
        if (map.getLevel() !== 4) map.setLevel(4, { animate: true });
      }, 350);
    } else if (!isInitialSet.current) {
      map.setCenter(latlng);
      map.setLevel(4);
      isInitialSet.current = true;
    }
  }, [map]);

  // 위치 추적 설정
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const pos = { lat: latitude, lng: longitude };
        setMyLocation(pos);
        
        // 최초 1회 자동 이동
        if (!isInitialSet.current && map) {
          applyLocationToMap(latitude, longitude, false);
        }
        
        // 따라가기 모드
        if (isFollowing && map) {
          map.panTo(new window.kakao.maps.LatLng(latitude, longitude));
        }
      },
      (err) => console.warn("Watch Error:", err.code, err.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, isFollowing, applyLocationToMap]);

  // 현위치 버튼 클릭 시 실행 (시스템 팝업 강제 유도 포함)
  const moveToMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMyLocation({ lat: latitude, lng: longitude });
          applyLocationToMap(latitude, longitude, true);
          setIsFollowing(true);
        },
        (err) => {
          console.error("Geolocation Error:", err);
          if (err.code === 1) {
            alert("위치 정보 권한이 거부되었습니다. 설정에서 위치 권한을 허용해 주세요.");
          } else {
            alert("위치 정보를 가져올 수 없습니다. GPS 상태를 확인해 주세요.");
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [applyLocationToMap]);

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
        onCreate={(m) => {
          setMap(m);
          m.setMaxLevel(11);
          // 모바일 레이아웃 강제 갱신
          setTimeout(() => m.relayout(), 100);
        }}
        style={containerStyle}
        onDragStart={() => setIsFollowing(false)}
        onCenterChanged={handleBoundsCheck}
        className={isDark ? 'kakao-dark-theme' : ''}
      >
        {/* 모바일 가시성을 확보한 현위치 오버레이 */}
        {myLocation && (
          <CustomOverlayMap 
            position={myLocation} 
            zIndex={10} // 우선순위 상향
          >
            <div className="relative flex items-center justify-center" style={{ transform: 'translate(0, 0)' }}>
              <div className="absolute w-20 h-20 bg-blue-500/20 rounded-full animate-ping"></div>
              <div className="absolute w-12 h-12 bg-blue-400/30 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
              <div className="relative w-7 h-7 bg-blue-600 rounded-full border-[3px] border-white shadow-[0_0_20px_rgba(37,99,235,1)] flex items-center justify-center">
                <Navigation2 size={14} className="text-white fill-current" />
              </div>
            </div>
          </CustomOverlayMap>
        )}
      </Map>

      {/* Control Panel (모바일 터치 최적화) */}
      <div className="absolute right-6 bottom-28 sm:right-8 sm:top-1/2 sm:-translate-y-1/2 z-30 flex flex-col gap-5 pointer-events-none">
        <div className="flex flex-col bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[24px] overflow-hidden shadow-2xl pointer-events-auto">
          <button onClick={zoomIn} className="p-6 sm:p-4 hover:bg-white/10 border-b border-white/5 text-white active:bg-white/20 active:scale-95 transition-all">
            <Plus size={28} className="sm:w-5 sm:h-5" />
          </button>
          <button onClick={zoomOut} className="p-6 sm:p-4 hover:bg-white/10 text-white active:bg-white/20 active:scale-95 transition-all">
            <Minus size={28} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        <button 
          onClick={moveToMyLocation} 
          className={`p-6 sm:p-4 rounded-full backdrop-blur-3xl border transition-all duration-500 shadow-2xl flex items-center justify-center pointer-events-auto active:scale-90
            ${isFollowing ? 'bg-blue-600 border-blue-400 text-white animate-pulse' : 'bg-black/60 border-white/10 text-white/70'}
          `}
        >
          <Target size={32} className="sm:w-6 sm:h-6" />
        </button>
      </div>

      <style>{`
        .kakao-dark-theme { filter: invert(100%) hue-rotate(180deg) brightness(0.95) contrast(1.1) grayscale(0.1); background-color: #05070a !important; }
        .kakao-dark-theme img[src*="dapi.kakao.com"] { filter: none !important; }
        .kakao-dark-theme .kakao-copyright, .kakao-dark-theme .kakao-logo { filter: invert(100%) hue-rotate(180deg) !important; opacity: 0.3; }
        @media (max-width: 640px) { 
          .kakao-copyright, .kakao-logo { transform: scale(0.85); transform-origin: bottom right; } 
        }
      `}</style>
    </div>
  );
};

export default Main;
