import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Compass, Plus, Minus, Target, Navigation2, ShieldAlert, X, ChevronRight, Settings } from 'lucide-react';

/**
 * [Page] 메인 페이지 (위치 권한 가이드 및 모바일 최적화 버전)
 * @version 5.8.0
 * @author Antigravity
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
  const [showGuide, setShowGuide] = useState(false);
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

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const pos = { lat: latitude, lng: longitude };
        setMyLocation(pos);
        if (map && !isInitialSet.current) {
          map.setCenter(new window.kakao.maps.LatLng(latitude, longitude));
          map.setLevel(4);
          isInitialSet.current = true;
        }
        if (isFollowing && map) map.panTo(new window.kakao.maps.LatLng(latitude, longitude));
      },
      (err) => {
        console.warn("Geolocation Issue:", err);
        // 권한 거부 시 가이드는 사용자가 버튼을 눌렀을 때 명시적으로 보여주기 위해 여기서 자동 팝업은 자제합니다.
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, isFollowing]);

  const zoomIn = () => map?.setLevel(map.getLevel() - 1, { animate: true });
  const zoomOut = () => {
    if (map && map.getLevel() < 11) map.setLevel(map.getLevel() + 1, { animate: true });
  };

  const moveToMyLocation = useCallback(() => {
    if (myLocation && map) {
      map.panTo(new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng));
      setTimeout(() => map.setLevel(4, { animate: true }), 400);
      setIsFollowing(true);
    } else {
      setShowGuide(true); // 위치 정보 없을 시 가이드 모달 표시
    }
  }, [myLocation, map]);

  if (loading) return <div className={`w-full h-screen ${isDark ? 'bg-[#05070a]' : 'bg-[#f4f7f9]'}`} />;

  return (
    <div className={`w-full h-screen relative overflow-hidden ${isDark ? 'bg-[#05070a]' : 'bg-[#f4f7f9]'}`}>
      <Map
        center={defaultCenter}
        level={4}
        onCreate={(m) => { setMap(m); m.setMaxLevel(11); }}
        style={containerStyle}
        onDragStart={() => setIsFollowing(false)}
        onCenterChanged={handleBoundsCheck}
        className={isDark ? 'kakao-dark-theme' : ''}
      >
        {myLocation && (
          <CustomOverlayMap position={myLocation} zIndex={3}>
            <div className="relative flex items-center justify-center p-4">
              <div className="absolute w-16 h-16 bg-blue-500 rounded-full animate-ping opacity-20"></div>
              <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-[0_0_20px_rgba(37,99,235,1)] flex items-center justify-center">
                <Navigation2 size={12} className="text-white fill-current" />
              </div>
            </div>
          </CustomOverlayMap>
        )}
      </Map>

      {/* Control Panel */}
      <div className="absolute right-6 bottom-28 sm:right-8 sm:top-1/2 sm:-translate-y-1/2 z-20 flex flex-col gap-4 pointer-events-none">
        <div className="flex flex-col bg-black/50 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto">
          <button onClick={zoomIn} className="p-5 sm:p-4 hover:bg-white/10 border-b border-white/5 text-white active:scale-90"><Plus size={24} className="sm:w-5 sm:h-5" /></button>
          <button onClick={zoomOut} className="p-5 sm:p-4 hover:bg-white/10 text-white/70 active:scale-90"><Minus size={24} className="sm:w-5 sm:h-5" /></button>
        </div>
        <button onClick={moveToMyLocation} className={`p-5 sm:p-4 rounded-full backdrop-blur-3xl border transition-all duration-500 shadow-2xl flex items-center justify-center pointer-events-auto active:scale-90 ${isFollowing ? 'bg-blue-600 border-blue-400 text-white animate-pulse' : 'bg-black/50 border-white/10 text-white/70 hover:text-white'}`}><Target size={28} className="sm:w-6 sm:h-6" /></button>
      </div>

      {/* Location Permission Guide Modal */}
      {showGuide && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#12141c] w-full max-w-md rounded-[32px] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-amber-500/20 rounded-3xl flex items-center justify-center mb-6 border border-amber-500/30">
                <ShieldAlert size={40} className="text-amber-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">위치 정보 권한이 필요합니다</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-8">
                현위치 기능을 사용하려면 브라우저와 기기의 위치 서비스 설정이 켜져 있어야 합니다.
              </p>
              
              <div className="w-full space-y-4 text-left">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs font-bold text-amber-500 uppercase mb-2 tracking-widest flex items-center gap-2">
                    <Settings size={12} /> iPhone (iOS) 설정
                  </p>
                  <p className="text-white/80 text-sm font-light">설정 &gt; 개인정보 보호 &gt; 위치 서비스 &gt; Safari(또는 사용 중인 브라우저) &gt; <span className="text-white font-medium">'앱을 사용하는 동안'</span> 체크</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs font-bold text-blue-500 uppercase mb-2 tracking-widest flex items-center gap-2">
                    <Settings size={12} /> Android Galaxy 설정
                  </p>
                  <p className="text-white/80 text-sm font-light">설정 &gt; 애플리케이션 &gt; 브라우저 앱 &gt; 권한 &gt; 위치 &gt; <span className="text-white font-medium">'앱 사용 중에만 허용'</span> 체크</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowGuide(false)}
              className="m-8 mt-0 bg-white text-black h-16 rounded-2xl font-bold text-lg hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              알겠습니다 <ChevronRight size={20} />
            </button>
          </div>
          <button onClick={() => setShowGuide(false)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"><X size={32} /></button>
        </div>
      )}

      <style>{`
        .kakao-dark-theme { filter: invert(100%) hue-rotate(180deg) brightness(0.95) contrast(1.1) grayscale(0.1); background-color: #05070a !important; }
        .kakao-dark-theme img[src*="dapi.kakao.com"] { filter: none !important; }
        .kakao-dark-theme .kakao-copyright, .kakao-dark-theme .kakao-logo { filter: invert(100%) hue-rotate(180deg) !important; opacity: 0.3; }
        @media (max-width: 640px) { .kakao-copyright, .kakao-logo { display: none !important; } }
      `}</style>
    </div>
  );
};

export default Main;
