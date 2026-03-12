import React, { useEffect, useRef, useState } from 'react';

/**
 * [Map Engine] Live Map with Day/Night Cycle
 * @version 1.9.0
 * @description 시간(KST)을 감지하여 지도의 테마를 자동으로 전환합니다.
 */
const Main = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const tileLayerRef = useRef(null);
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    if (!window.L) return;
    const L = window.L;

    // 현재 시간에 따른 낮/밤 판단 (KST 기준 07~19시 낮)
    const checkDayNight = () => {
      const hour = new Date().getHours();
      return hour < 7 || hour >= 19;
    };

    const nightMode = checkDayNight();
    setIsNight(nightMode);

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([37.5665, 126.9780], 13);

      // 초기 타일 설정
      const tileUrl = nightMode 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(mapInstance.current);
      mapRef.current.classList.add('map-loaded');
    }

    // 시간 변화 감지 및 타일 전환 로직
    const interval = setInterval(() => {
      const currentNightState = checkDayNight();
      if (currentNightState !== isNight) {
        setIsNight(currentNightState);
        const newUrl = currentNightState 
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
        
        if (tileLayerRef.current) {
          tileLayerRef.current.setUrl(newUrl);
        }
      }
    }, 60000); // 1분마다 체크

    return () => {
      clearInterval(interval);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isNight]);

  return (
    <div className={`w-full h-screen relative transition-colors duration-1000 overflow-hidden ${isNight ? 'bg-[#0a0c10]' : 'bg-[#f4f7f9]'}`}>
      {/* 1. Map Canvas Layer */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 z-0 transition-opacity duration-1000 opacity-0 [&.map-loaded]:opacity-100"
      />

      {/* 2. UI Overlay */}
      <div className="absolute bottom-32 left-8 z-20 pointer-events-none">
        <div className="backdrop-blur-xl bg-theme-bg/10 border border-theme-border/5 p-6 rounded-[2rem] inline-block pointer-events-auto shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-2 h-2 rounded-full animate-ping ${isNight ? 'bg-indigo-500' : 'bg-amber-500'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${isNight ? 'text-indigo-400' : 'text-amber-600'}`}>
              {isNight ? 'Night Cycle Active' : 'Day Cycle Active'}
            </span>
          </div>
          <h2 className={`text-xl font-black ${isNight ? 'text-white/90' : 'text-slate-800'} tracking-tighter mb-1 uppercase`}>
            Seoul Live
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
            Auto-Syncing Map Engine
          </p>
        </div>
      </div>

      {/* 3. Global Depth Overlay */}
      <div className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-1000 ${isNight ? 'bg-black/20' : 'bg-amber-500/5'}`} />
    </div>
  );
};

export default Main;
