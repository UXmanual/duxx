import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Compass, Plus, Minus, Target, Navigation2 } from 'lucide-react';

/**
 * [Page] 메인 페이지 (카카오 맵 모바일 대응 및 애니메이션 강화 버전)
 * @version 5.6.0
 * @author Antigravity
 * @description 
 * - 현위치 이동 시 위치 이동(panTo)과 줌(setLevel)을 부드럽게 연결했습니다.
 * - 모바일 환경에서 한 손 조작이 쉽도록 리모콘 배치를 최적화했습니다.
 * - 지도를 드래그할 때 한반도 외곽으로 나가는 것을 방지하는 가두기 로직을 유지합니다.
 */

const containerStyle = {
  width: '100%',
  height: '100vh',
};

// 한반도 유효 영역 (드래그 제한용)
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

  // 영역 가두기 로직 (드래그 시 호출)
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

  // 현위치 실시간 감지 및 초기 위치 설정
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const pos = { lat: latitude, lng: longitude };
          setMyLocation(pos);
          
          if (map) {
            if (!isInitialSet.current) {
              map.setCenter(new window.kakao.maps.LatLng(latitude, longitude));
              map.setLevel(4);
              isInitialSet.current = true;
            }
            if (isFollowing) {
              map.panTo(new window.kakao.maps.LatLng(latitude, longitude));
            }
          }
        },
        (err) => console.error("Geolocation Error:", err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [map, isFollowing]);

  // 버튼 인터랙션
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

  // 현위치로 부드럽게 이동 (애니메이션 강화)
  const moveToMyLocation = useCallback(() => {
    if (myLocation && map) {
      const latlng = new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng);
      
      // 1단계: 위치로 부드럽게 이동
      map.panTo(latlng);
      
      // 2단계: 약간의 시간차를 두고 줌 레벨 복원 (애니메이션이 겹쳐서 끊기지 않도록)
      setTimeout(() => {
        if (map.getLevel() !== 4) {
          map.setLevel(4, { animate: true });
        }
      }, 300);
      
      setIsFollowing(true);
    }
  }, [myLocation, map]);

  if (loading) {
    return (
      <div className={`w-full h-screen transition-colors duration-1000 ${isDark ? 'bg-[#05070a]' : 'bg-[#f4f7f9]'}`} />
    );
  }

  if (error || !import.meta.env.VITE_KAKAO_MAPS_API_KEY) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0c10] text-[#ff4b4b] p-10">
        <div className="bg-red-500/10 p-8 rounded-3xl border border-red-500/20 backdrop-blur-xl flex flex-col items-center">
            <Compass className="w-16 h-16 mb-6 animate-bounce" />
            <h2 className="text-3xl mb-4 font-black tracking-tighter uppercase text-red-500">System Failure</h2>
        </div>
      </div>
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
        {myLocation && (
          <>
            <CustomOverlayMap position={myLocation}>
              <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                <div className="absolute w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-[0_0_15px_rgba(37,99,235,0.8)] z-10 flex items-center justify-center">
                    <Navigation2 size={10} className="text-white fill-current" />
                </div>
              </div>
            </CustomOverlayMap>
            <MapMarker 
                position={myLocation}
                image={{
                    src: 'https://cdn-icons-png.flaticon.com/512/0/619.png',
                    size: { width: 1, height: 1 }
                }}
            />
          </>
        )}
      </Map>

      {/* Floating Control Interface (모바일 대응 최적화) */}
      <div className="absolute right-6 sm:right-8 bottom-24 sm:top-1/2 sm:-translate-y-1/2 z-20 flex flex-col gap-4">
        <div className="flex flex-col bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto text-white">
            <button onClick={zoomIn} className="p-4 sm:p-4 hover:bg-white/10 transition-colors border-b border-white/5 active:scale-95">
                <Plus size={20} className="sm:w-5 sm:h-5 w-6 h-6" />
            </button>
            <button onClick={zoomOut} className="p-4 sm:p-4 hover:bg-white/10 transition-colors text-white/70 hover:text-white active:scale-95">
                <Minus size={20} className="sm:w-5 sm:h-5 w-6 h-6" />
            </button>
        </div>

        <button 
            onClick={moveToMyLocation}
            className={`p-4 sm:p-4 rounded-full backdrop-blur-2xl border transition-all duration-500 shadow-2xl flex items-center justify-center pointer-events-auto active:scale-90
                ${isFollowing 
                    ? 'bg-blue-600 border-blue-400 text-white animate-pulse' 
                    : 'bg-black/40 border-white/10 text-white/70 hover:text-white hover:bg-black/60'
                }`}
        >
            <Target size={24} className="sm:w-[22px] sm:h-[22px]" />
        </button>
      </div>

      <div className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-1000 ${isDark ? 'bg-black/10 mix-blend-overlay' : 'bg-transparent'}`} />

      <style>{`
        .kakao-dark-theme {
            filter: invert(100%) hue-rotate(180deg) brightness(0.9) contrast(1.1) grayscale(0.2);
            background-color: #05070a !important;
        }
        .kakao-dark-theme img[src*="dapi.kakao.com"] {
            filter: none !important;
        }
        .kakao-dark-theme .kakao-copyright,
        .kakao-dark-theme .kakao-logo {
            filter: invert(100%) hue-rotate(180deg) !important;
            opacity: 0.4;
        }
        @media (max-width: 640px) {
            .kakao-copyright, .kakao-logo {
                display: none !important;
            }
        }
      `}</style>
    </div>
  );
};

export default Main;
