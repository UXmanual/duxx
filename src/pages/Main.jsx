import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Compass, Plus, Minus, Target, Navigation2 } from 'lucide-react';

/**
 * [Page] 메인 페이지 (카카오 맵 완전 순정 복구 버전)
 * @version 5.3.0
 * @author Antigravity
 * @description 
 * - 사용자의 강력한 요청에 따라 카카오 맵의 모든 순정 인터랙션을 완벽하게 복구했습니다.
 * - 줌인/줌아웃/드래그 시 리액트 상태가 간섭하지 않도록 설계를 단순화했습니다.
 * - 초기 로드 시 현위치(레벨 4)를 우선 표시하며, 최대 줌아웃만 레벨 11로 제한합니다.
 */

const containerStyle = {
  width: '100%',
  height: '100vh',
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

  // 초기값으로만 사용하고, 이후에는 map 인스턴스를 직접 제어하여 성능과 인터랙션을 보장합니다.
  const [initialCenter] = useState(defaultCenter);
  const [initialLevel] = useState(4);

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAPS_API_KEY,
    libraries: ['services', 'clusterer', 'drawing'],
  });

  // 현위치 실시간 감지 및 초기 위치 설정
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const pos = { lat: latitude, lng: longitude };
          setMyLocation(pos);
          
          if (map) {
            // 최초 로드 시 현위치로 이동
            if (!isInitialSet.current) {
              map.setCenter(new window.kakao.maps.LatLng(latitude, longitude));
              map.setLevel(4);
              isInitialSet.current = true;
            }
            // 따라가기 모드 시 이동
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

  // 버튼 인터랙션 (SDK 순정 방식)
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
      map.panTo(new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng));
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
        center={initialCenter}
        level={initialLevel}
        onCreate={(m) => {
          setMap(m);
          m.setMaxLevel(11); // 축소 한도 11로 설정
        }}
        style={containerStyle}
        onDragStart={() => setIsFollowing(false)}
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

      {/* Floating Control Interface */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
        <div className="flex flex-col bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto text-white">
            <button onClick={zoomIn} className="p-4 hover:bg-white/10 transition-colors border-b border-white/5">
                <Plus size={20} />
            </button>
            <button onClick={zoomOut} className="p-4 hover:bg-white/10 transition-colors">
                <Minus size={20} />
            </button>
        </div>

        <button 
            onClick={moveToMyLocation}
            className={`p-4 rounded-full backdrop-blur-2xl border transition-all duration-500 shadow-2xl flex items-center justify-center pointer-events-auto
                ${isFollowing 
                    ? 'bg-blue-600 border-blue-400 text-white animate-pulse' 
                    : 'bg-black/40 border-white/10 text-white/70 hover:text-white hover:bg-black/60'
                }`}
        >
            <Target size={22} />
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
      `}</style>
    </div>
  );
};

export default Main;
