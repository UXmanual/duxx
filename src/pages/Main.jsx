import React, { useState, useEffect, useCallback } from 'react';
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Compass, Plus, Minus, Target, Navigation2 } from 'lucide-react';

/**
 * [Page] 메인 페이지 (카카오 맵 엔진 프리미엄 버전)
 * @version 4.7.0
 * @author Antigravity
 * @description 
 * - 카카오 맵 SDK를 활용한 하이엔드 맵 서비스입니다.
 * - 지도의 자유로운 드래그 및 휠 줌을 위해 비제어 컴포넌트(Uncontrolled) 방식을 채택했습니다.
 * - 사용자의 현재 위치를 실시간으로 감지하고 초기 화면으로 설정합니다.
 * - 대한민국 영역을 벗어나는 줌아웃 여백을 물리적으로 차단합니다.
 */

const containerStyle = {
  width: '100%',
  height: '100vh',
  backgroundColor: '#05070a'
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
  const [isInitialLocationSet, setIsInitialLocationSet] = useState(false);

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAPS_API_KEY,
    libraries: ['services', 'clusterer', 'drawing'],
  });

  // 한반도 영역 정의 (줌아웃 여백 방지용)
  const KOREA_BOUNDS = {
    sw: { lat: 33.0, lng: 124.0 },
    ne: { lat: 39.0, lng: 132.0 }
  };

  // 영역 제한 체크 로직
  const checkBounds = useCallback((mapInstance) => {
    if (mapInstance.getLevel() < 10) return;

    const latlng = mapInstance.getCenter();
    let lat = latlng.getLat();
    let lng = latlng.getLng();

    if (lat < KOREA_BOUNDS.sw.lat) lat = KOREA_BOUNDS.sw.lat;
    if (lat > KOREA_BOUNDS.ne.lat) lat = KOREA_BOUNDS.ne.lat;
    if (lng < KOREA_BOUNDS.sw.lng) lng = KOREA_BOUNDS.sw.lng;
    if (lng > KOREA_BOUNDS.ne.lng) lng = KOREA_BOUNDS.ne.lng;

    if (lat !== latlng.getLat() || lng !== latlng.getLng()) {
      mapInstance.setCenter(new window.kakao.maps.LatLng(lat, lng));
    }
  }, []);

  // 현위치 실시간 감지 및 자동 이동 컨트롤
  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos = { lat: latitude, lng: longitude };
          setMyLocation(newPos);
          
          if (map) {
            // 최초 로드 시 현위치로 이동
            if (!isInitialLocationSet) {
              map.setCenter(new window.kakao.maps.LatLng(latitude, longitude));
              map.setLevel(4);
              setIsInitialLocationSet(true);
            }
            // 따라가기 모드 활성화 시 이동
            if (isFollowing) {
              map.panTo(new window.kakao.maps.LatLng(latitude, longitude));
            }
          }
        },
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true }
      );
    }
    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, isFollowing, isInitialLocationSet]);

  // UI 버튼 인터랙션
  const zoomIn = () => {
    if (map) map.setLevel(map.getLevel() - 1, { animate: true });
  };
  const zoomOut = () => {
    if (map && map.getLevel() < 13) map.setLevel(map.getLevel() + 1, { animate: true });
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
              1. <b>JavaScript 키</b>를 사용 중인가요? (REST API 키 X)<br/>
              2. 도메인에 <b>{window.location.host}</b>가 등록되어 있나요?<br/>
              3. Vercel 환경 변수가 정확히 등록되었나요?
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-screen relative overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-[#05070a]' : 'bg-[#f4f7f9]'}`}>
      
      <Map
        center={defaultCenter} // 초기 로드 후 Geolocation이 작동하기 전까지의 임시 중심
        level={4}
        minLevel={1}
        maxLevel={13} // 대한민국이 가득 차는 축소 한도
        onCreate={setMap}
        style={containerStyle}
        onDragStart={() => setIsFollowing(false)}
        onCenterChanged={(mapInstance) => {
            checkBounds(mapInstance); // 여백 발생 방지
        }}
        className={`transition-all duration-1000 ${isDark ? 'kakao-dark-theme' : ''}`}
      >
        {/* 내 위치 마커 & 펄스 효과 */}
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

      {/* Global Depth Overlay (Post-Processing) */}
      <div className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-1000 ${isDark ? 'bg-black/10 mix-blend-overlay' : 'bg-transparent'}`} />

      {/* Dark Theme Filters & Animations */}
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
