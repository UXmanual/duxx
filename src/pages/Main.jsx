import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Compass, Plus, Minus, Target, Navigation2 } from 'lucide-react';

/**
 * [Page] 메인 페이지 (카카오 맵 엔진 클린 리빌드 버전)
 * @version 5.1.0
 * @author Antigravity
 * @description 
 * - 모든 제약 로직을 삭제하고 카카오 맵 SDK 본연의 기능을 최대한 살려 다시 구현했습니다.
 * - 초기 로드 시 사용자의 현위치를 우선적으로 표시합니다.
 * - 줌 인/아웃 및 드래그가 제약 없이 완벽하게 작동하도록 설계했습니다.
 */

const containerStyle = {
  width: '100%',
  height: '100vh',
};

// 기본 중심 (서울시청)
const defaultCenter = {
  lat: 37.5665,
  lng: 126.9780
};

const Main = () => {
  const { isDark } = useTheme();
  const [map, setMap] = useState(null);
  
  // 지도의 실시간 상태관리
  const [state, setState] = useState({
    center: defaultCenter,
    level: 4,
    isPanto: false,
  });

  const [myLocation, setMyLocation] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const isInitialSet = useRef(false);

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAPS_API_KEY,
    libraries: ['services', 'clusterer', 'drawing'],
  });

  // 사용자의 현위치 실시간 감지
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos = { lat: latitude, lng: longitude };
          setMyLocation(newPos);
          
          // 최초 1회 현위치 설정
          if (!isInitialSet.current) {
            setState({
              center: newPos,
              level: 4,
              isPanto: false
            });
            isInitialSet.current = true;
          }

          // 따라가기 모드 시 중심 이동
          if (isFollowing) {
            setState(prev => ({
              ...prev,
              center: newPos,
              isPanto: true
            }));
          }
        },
        (err) => console.error("Geolocation Error:", err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isFollowing]);

  // 버튼 인터랙션 전 전용 함수
  const zoomIn = () => {
    setState(prev => ({ ...prev, level: Math.max(prev.level - 1, 1), isPanto: false }));
  };
  
  const zoomOut = () => {
    setState(prev => ({ ...prev, level: Math.min(prev.level + 1, 13), isPanto: false }));
  };

  const moveToMyLocation = useCallback(() => {
    if (myLocation) {
      setState(prev => ({
        ...prev,
        center: myLocation,
        isPanto: true
      }));
      setIsFollowing(true);
    }
  }, [myLocation]);

  if (loading) {
    return (
      <div className={`w-full h-screen transition-colors duration-1000 ${isDark ? 'bg-[#05070a]' : 'bg-[#f4f7f9]'}`} />
    );
  }

  if (error || !import.meta.env.VITE_KAKAO_MAPS_API_KEY) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0c10] text-[#ff4b4b] p-10">
        <div className="bg-red-500/10 p-8 rounded-3xl border border-red-500/20 backdrop-blur-xl flex flex-col items-center text-center">
            <Compass className="w-16 h-16 mb-6 animate-bounce" />
            <h2 className="text-3xl mb-4 font-black tracking-tighter uppercase text-red-500">System Failure</h2>
            <p className="text-white/60 max-w-sm font-mono text-sm leading-relaxed">
              {!import.meta.env.VITE_KAKAO_MAPS_API_KEY ? 'Status: API KEY MISSING' : 'Status: KAKAO SDK LOAD FAILED'}
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-screen relative overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-[#05070a]' : 'bg-[#f4f7f9]'}`}>
      
      <Map
        center={state.center}
        level={state.level}
        isPanto={state.isPanto}
        onCreate={setMap}
        style={containerStyle}
        onDragStart={() => setIsFollowing(false)}
        onCenterChanged={(mapInstance) => {
          setState(prev => ({
            ...prev,
            center: {
              lat: mapInstance.getCenter().getLat(),
              lng: mapInstance.getCenter().getLng(),
            },
            isPanto: false
          }));
        }}
        onZoomChanged={(mapInstance) => {
          setState(prev => ({
            ...prev,
            level: mapInstance.getLevel(),
            isPanto: false
          }));
        }}
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
            <button onClick={zoomIn} className="p-4 hover:bg-white/10 transition-colors border-b border-white/5 disabled:opacity-30">
                <Plus size={20} />
            </button>
            <button onClick={zoomOut} className="p-4 hover:bg-white/10 transition-colors disabled:opacity-30">
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
