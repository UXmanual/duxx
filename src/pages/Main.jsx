import React, { useState, useEffect, useCallback } from 'react';
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Compass, Plus, Minus, Target, Navigation2 } from 'lucide-react';

/**
 * [Page] 메인 페이지 (카카오 맵 엔진 하이엔드 버전)
 * @version 4.8.0
 * @author Antigravity
 * @description 
 * - 카카오 맵 SDK를 활용한 자유로운 줌/드레이그 인터랙션 제공
 * - 초기 로드 시 현위치 중심 자동 설정 (레벨 4)
 * - 줌아웃 최대치만 대한민국 전역(레벨 13)으로 제한하여 여백 발생 방지
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
  
  // 맵의 중심과 레벨은 SDK 내부 동작을 방해하지 않도록 '최초 1회' 혹은 '특수한 이동' 시에만 명령형으로 제어합니다.
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapLevel, setMapLevel] = useState(4);

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAPS_API_KEY,
    libraries: ['services', 'clusterer', 'drawing'],
  });

  // 사용자의 현위치 실시간 감지
  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos = { lat: latitude, lng: longitude };
          setMyLocation(newPos);
          
          // 최초 1회 또는 따라가기 모드일 때만 지도의 중심을 변경
          if (!isInitialSet.current || isFollowing) {
            setMapCenter(newPos);
            setMapLevel(4);
            isInitialSet.current = true;
          }
        },
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true }
      );
    }
    const isInitialSet = { current: false };
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isFollowing]);

  // 버튼을 통한 줌 인/아웃 (명령형 API 사용)
  const zoomIn = () => {
    if (map) map.setLevel(map.getLevel() - 1, { animate: true });
  };
  
  const zoomOut = () => {
    if (map) {
      const currentLevel = map.getLevel();
      if (currentLevel < 13) {
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
            <p className="text-white/60 max-w-sm text-center font-mono text-sm leading-relaxed mb-4">
              {!import.meta.env.VITE_KAKAO_MAPS_API_KEY ? 'Status: API KEY MISSING' : 'Status: KAKAO SDK LOAD FAILED'}
            </p>
            <p className="text-white/40 max-w-sm text-center font-light text-xs leading-relaxed">
              카카오 개발자 콘솔에서 다음을 확인해 주세요:<br/>
              1. JavaScript 키를 사용 중인가요? (REST API 키 X)<br/>
              2. 도메인에 {window.location.host}가 등록되어 있나요?<br/>
              3. Vercel 환경 변수가 정확히 등록되었나요?
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-screen relative overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-[#05070a]' : 'bg-[#f4f7f9]'}`}>
      
      <Map
        center={mapCenter}
        level={mapLevel}
        onCreate={setMap}
        style={containerStyle}
        maxLevel={13} // 줌아웃 최대치 제한 (여백 방지)
        onDragStart={() => setIsFollowing(false)}
        onZoomChanged={(mapInstance) => {
          // 최대 줌아웃 레벨 강제 고정 (휠 동작 대응)
          if (mapInstance.getLevel() > 13) {
            mapInstance.setLevel(13);
          }
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
        <div className="flex flex-col bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto">
            <button onClick={zoomIn} className="p-4 hover:bg-white/10 transition-colors text-white/70 hover:text-white border-b border-white/5">
                <Plus size={20} />
            </button>
            <button onClick={zoomOut} className="p-4 hover:bg-white/10 transition-colors text-white/70 hover:text-white">
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

      {/* Global Depth Overlay */}
      <div className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-1000 ${isDark ? 'bg-black/10 mix-blend-overlay' : 'bg-transparent'}`} />

      {/* Dark Theme Filters */}
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
