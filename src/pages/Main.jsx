import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Compass, Plus, Minus, Target, Navigation2, Loader2, Settings, X, ChevronRight, Globe, ShieldCheck } from 'lucide-react';

/**
 * [Page] 메인 페이지 (하이엔드 권한 가이드 & iOS 안정화 버전)
 * @version 6.3.0
 * @author Antigravity
 * @description 
 * - 사용자 불만이 있었던 네이티브 Alert를 제거하고, 하이엔드 바텀 시트(Bottom Sheet) 가이드를 도입했습니다.
 * - 시스템 보안 정책상 권한 거부 시 다시 팝업을 띄울 수 없는 이유를 시각적으로 친절히 설명합니다.
 * - iOS/AOS 기기별 맞춤형 설정 경로를 고해상도 그래픽과 함께 제공합니다.
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
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
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

  const fetchLocation = useCallback((shouldAnimate = true) => {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMyLocation({ lat: latitude, lng: longitude });
        if (map) {
          const latlng = new window.kakao.maps.LatLng(latitude, longitude);
          if (shouldAnimate) {
            map.panTo(latlng);
            setTimeout(() => map.setLevel(4, { animate: true }), 300);
          } else {
            map.setCenter(latlng);
            map.setLevel(4);
          }
        }
        setIsFollowing(true);
        setIsLocating(false);
        setShowPermissionGuide(false);
      },
      (err) => {
        setIsLocating(false);
        // 권한 거부(1) 시에만 가이드 바텀시트 표시
        if (err.code === 1) {
          setShowPermissionGuide(true);
        }
        console.error("GeoError:", err);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }, [map]);

  useEffect(() => {
    if (map && !isInitialSet.current) {
      setTimeout(() => {
        fetchLocation(false);
        map.relayout();
      }, 500);
      isInitialSet.current = true;
    }
  }, [map, fetchLocation]);

  useEffect(() => {
    if (!navigator.geolocation) return;
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
  }, [map, isFollowing]);

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

      {/* Control Panel */}
      <div className="fixed right-6 bottom-32 sm:right-8 sm:top-1/2 sm:-translate-y-1/2 z-[40] flex flex-col gap-6">
        <div className="flex flex-col bg-black/70 backdrop-blur-3xl border border-white/20 rounded-[24px] overflow-hidden shadow-2xl">
          <button type="button" onClick={(e) => { e.stopPropagation(); map?.setLevel(map.getLevel() - 1, { animate: true }); }} className="p-6 sm:p-4 text-white active:bg-white/20 border-b border-white/10"><Plus size={28} className="sm:w-6 sm:h-6" /></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); if (map?.getLevel() < 11) map?.setLevel(map.getLevel() + 1, { animate: true }); }} className="p-6 sm:p-4 text-white/70 active:bg-white/20"><Minus size={28} className="sm:w-6 sm:h-6" /></button>
        </div>
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); fetchLocation(true); }}
          disabled={isLocating}
          className={`p-6 sm:p-5 rounded-full backdrop-blur-3xl border transition-all duration-300 shadow-2xl flex items-center justify-center active:scale-90
            ${isLocating ? 'bg-amber-500 border-amber-300 text-white' : isFollowing ? 'bg-blue-600 border-blue-400 text-white animate-pulse' : 'bg-black/70 border-white/20 text-white/80'}
          `}
        >
          {isLocating ? <Loader2 size={32} className="animate-spin sm:w-7 sm:h-7" /> : <Target size={32} className="sm:w-7 sm:h-7" />}
        </button>
      </div>

      {/* Premium Bottom Sheet Guide (권한 거부 시에만) */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-500 pointer-events-none ${showPermissionGuide ? 'bg-black/40 opacity-100 pointer-events-auto backdrop-blur-sm' : 'bg-transparent opacity-0'}`} onClick={() => setShowPermissionGuide(false)}>
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-[#12141c] rounded-t-[40px] border-t border-white/10 p-8 pt-4 pb-12 transition-transform duration-500 ease-out shadow-[0_-20px_60px_rgba(0,0,0,0.8)]
            ${showPermissionGuide ? 'translate-y-0' : 'translate-y-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
          
          <div className="flex flex-col items-center max-w-lg mx-auto">
            <div className="w-20 h-20 bg-blue-500/10 rounded-[2.5rem] flex items-center justify-center mb-6 border border-blue-500/20">
              <ShieldCheck size={42} className="text-blue-500" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">위치 접근이 거부되었습니다</h3>
            <p className="text-white/40 text-sm font-light leading-relaxed mb-10 text-center">
              브라우저 보안 정책에 따라 한 번 거부된 권한은<br/> 
              <span className="text-white/80 font-medium">설정 앱에서 수동으로 다시 허용</span>해 주셔야 합니다.
            </p>

            <div className="w-full space-y-4 mb-10">
              <div className="flex items-center gap-5 p-5 bg-white/5 rounded-3xl border border-white/5">
                <div className="w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10 italic text-[#007AFF] font-black italic">i</div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">iOS iPhone</p>
                  <p className="text-white/90 text-[14px] leading-snug">설정 &gt; 개인정보 보호 &gt; 위치 서비스 &gt; 브라우저 &gt; <span className="text-blue-400 font-bold">'앱을 사용하는 동안'</span></p>
                </div>
              </div>

              <div className="flex items-center gap-5 p-5 bg-white/5 rounded-3xl border border-white/5">
                <div className="w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10"><Globe size={20} className="text-[#34A853]" /></div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Android Galaxy</p>
                  <p className="text-white/90 text-[14px] leading-snug">설정 &gt; 애플리케이션 &gt; 브라우저 &gt; 권한 &gt; 위치 &gt; <span className="text-green-400 font-bold">'앱 사용 중에만 허용'</span></p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowPermissionGuide(false)}
              className="w-full py-5 bg-white text-black rounded-3xl font-bold text-lg active:scale-[0.97] transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              알겠습니다 <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .kakao-dark-theme { filter: invert(100%) hue-rotate(180deg) brightness(0.95) contrast(1.1) grayscale(0.1); background-color: #05070a !important; }
        .kakao-dark-theme img[src*="dapi.kakao.com"] { filter: none !important; }
        @media (max-width: 640px) { .kakao-copyright, .kakao-logo { transform: scale(0.8); transform-origin: bottom right; } }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
};

export default Main;
