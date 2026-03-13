import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Compass, Plus, Minus, Target, Navigation2 } from 'lucide-react';

/**
 * [Page] 메인 페이지 (모바일/웹 통합 하이엔드 버전)
 * @version 5.7.0
 * @author Antigravity
 * @description 
 * - 모바일 기기에서의 마커 가시성 및 인터랙션을 대폭 강화했습니다.
 * - 지연 로딩 및 위치 권한 거부 상황을 고려한 예외 처리를 추가했습니다.
 * - 모바일 하단 리모콘 레이아웃을 최적화하고 줌/이동 애니메이션을 최적화했습니다.
 */

const containerStyle = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0
};

// 한반도 유효 영역 (드래그 제한용 - 모바일은 핑거 줌 고려하여 여유 있게 설정)
const KOREA_BOUNDS = {
  sw: { lat: 31.0, lng: 122.0 },
  ne: { lat: 40.5, lng: 134.0 }
};

const defaultCenter = {
  lat: 37.5665,
  lng: 126.9780
};

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

  // 영역 가두기 로직 (모바일 드래그/핀치 줌 최적화)
  const handleBoundsCheck = useCallback((mapInstance) => {
    if (!mapInstance) return;
    
    const center = mapInstance.getCenter();
    const lat = center.getLat();
    const lng = center.getLng();
    
    let targetLat = lat;
    let targetLng = lng;
    let isOutOfRange = false;

    if (lat < KOREA_BOUNDS.sw.lat) { targetLat = KOREA_BOUNDS.sw.lat; isOutOfRange = true; }
    if (lat > KOREA_BOUNDS.ne.lat) { targetLat = KOREA_BOUNDS.ne.lat; isOutOfRange = true; }
    if (lng < KOREA_BOUNDS.sw.lng) { targetLng = KOREA_BOUNDS.sw.lng; isOutOfRange = true; }
    if (lng > KOREA_BOUNDS.ne.lng) { targetLng = KOREA_BOUNDS.ne.lng; isOutOfRange = true; }

    if (isOutOfRange) {
      mapInstance.setCenter(new window.kakao.maps.LatLng(targetLat, targetLng));
    }
  }, []);

  // 현위치 실시간 추적
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const pos = { lat: latitude, lng: longitude };
        setMyLocation(pos);
        
        if (map) {
          // 초기 진입 시 현위치 고정
          if (!isInitialSet.current) {
            map.setCenter(new window.kakao.maps.LatLng(latitude, longitude));
            map.setLevel(4);
            isInitialSet.current = true;
          }
          // 따라가기 모드일 때만 자동 이동
          if (isFollowing) {
            map.panTo(new window.kakao.maps.LatLng(latitude, longitude));
          }
        }
      },
      (err) => console.warn("Geolocation denied or unavailable:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, isFollowing]);

  // 화면 리사이즈 시 지도 레이아웃 재계산 (모바일 회전 대비)
  useEffect(() => {
    const handleResize = () => {
      if (map) map.relayout();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);

  const zoomIn = () => {
    if (map) map.setLevel(map.getLevel() - 1, { animate: true });
  };
  
  const zoomOut = () => {
    if (map) {
      const currentLevel = map.getLevel();
      if (currentLevel < 11) {
        map.setLevel(currentLevel + 1, { animate: true });
      }
    }
  };

  const moveToMyLocation = useCallback(() => {
    if (myLocation && map) {
      const latlng = new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng);
      
      // 모바일에서 더 부드러운 전환을 위해 panTo와 setLevel 조합
      map.panTo(latlng);
      
      setTimeout(() => {
        if (map.getLevel() !== 4) {
          map.setLevel(4, { animate: true });
        }
      }, 400);
      
      setIsFollowing(true);
    } else if (!myLocation) {
        alert("위치 정보를 불러올 수 없습니다. GPS가 켜져 있는지 확인해 주세요.");
    }
  }, [myLocation, map]);

  if (loading) {
    return (
      <div className={`w-full h-screen transition-colors duration-1000 ${isDark ? 'bg-[#05070a]' : 'bg-[#f4f7f9]'}`} />
    );
  }

  return (
    <div className={`w-full h-screen relative overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-[#05070a]' : 'bg-[#f4f7f9]'}`}>
      
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
        className={`transition-all duration-1000 ${isDark ? 'kakao-dark-theme' : ''}`}
      >
        {/* 모바일 가시성을 높인 현위치 마커 커스텀 */}
        {myLocation && (
          <CustomOverlayMap position={myLocation} zIndex={3}>
            <div className="relative flex items-center justify-center p-4">
              {/* 펄스 애니메이션 (모바일에서 더 선명하게 보이도록 확장) */}
              <div className="absolute w-16 h-16 bg-blue-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute w-10 h-10 bg-blue-400 rounded-full animate-ping opacity-30" style={{ animationDelay: '0.4s' }}></div>
              
              {/* 중심 아이콘 (그림자 추가로 시인성 확보) */}
              <div className="relative w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-[0_0_20px_rgba(37,99,235,1)] flex items-center justify-center shadow-lg">
                <Navigation2 size={12} className="text-white fill-current" />
              </div>
            </div>
          </CustomOverlayMap>
        )}
      </Map>

      {/* 모바일 최적화 클로즈업 리모콘 (하단 배치로 한 손 조작성 극대화) */}
      <div className="absolute right-6 bottom-28 sm:right-8 sm:top-1/2 sm:-translate-y-1/2 z-20 flex flex-col gap-4 pointer-events-none">
        
        <div className="flex flex-col bg-black/50 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto">
          <button 
            onClick={zoomIn} 
            className="p-5 sm:p-4 hover:bg-white/10 active:bg-white/20 transition-all border-b border-white/5 text-white active:scale-90"
            aria-label="Zoom In"
          >
            <Plus size={24} className="sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={zoomOut} 
            className="p-5 sm:p-4 hover:bg-white/10 active:bg-white/20 transition-all text-white/70 hover:text-white active:scale-90"
            aria-label="Zoom Out"
          >
            <Minus size={24} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <button 
          onClick={moveToMyLocation}
          className={`p-5 sm:p-4 rounded-full backdrop-blur-3xl border transition-all duration-500 shadow-2xl flex items-center justify-center pointer-events-auto active:scale-90
            ${isFollowing 
              ? 'bg-blue-600 border-blue-400 text-white animate-pulse' 
              : 'bg-black/50 border-white/10 text-white/70 hover:text-white'
            }`}
          aria-label="My Location"
        >
          <Target size={28} className="sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* 다크모드 오버레이 (모바일 눈 피로도 감소) */}
      <div className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-1000 ${isDark ? 'bg-black/5 mix-blend-multiply' : 'bg-transparent'}`} />

      {/* 카카오맵 테마 및 모바일 전용 스타일 */}
      <style>{`
        .kakao-dark-theme {
          filter: invert(100%) hue-rotate(180deg) brightness(0.95) contrast(1.1) grayscale(0.1);
          background-color: #05070a !important;
        }
        .kakao-dark-theme img[src*="dapi.kakao.com"] {
          filter: none !important;
        }
        .kakao-dark-theme .kakao-copyright,
        .kakao-dark-theme .kakao-logo {
          filter: invert(100%) hue-rotate(180deg) !important;
          opacity: 0.3;
        }
        /* 모바일에서 불필요한 저작권 문구 축소 */
        @media (max-width: 640px) {
          .kakao-copyright, .kakao-logo {
            transform: scale(0.8);
            transform-origin: bottom right;
          }
        }
        /* 터치 영역 미스 방지를 위한 버튼 간격 최적화 */
        .pointer-events-auto {
          touch-action: manipulation;
        }
      `}</style>
    </div>
  );
};

export default Main;
