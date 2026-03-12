import React, { useEffect, useRef } from 'react';

/**
 * [Map Engine] Live Map Container
 * @description Leaflet을 활용한 실시간 지도 엔진입니다. 
 * @principle 자기 결정적 레이아웃: h-screen으로 전체 화면을 점유합니다.
 */
const Main = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    // CDN을 통해 로드된 Leaflet(window.L) 확인
    if (!window.L) {
      console.error('Leaflet is not loaded. Checking index.html CDN links.');
      return;
    }

    const L = window.L;

    // 지도 초기화 (서울 기준: [37.5665, 126.9780])
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false, // 커스텀 UI를 위해 기본 컨트롤 제거
        attributionControl: false
      }).setView([37.5665, 126.9780], 13);

      // 프리미엄 다크 테마 타일 레이어 (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(mapInstance.current);

      // 지도 로드 완료 시 프리미엄한 페이드 인 효과를 위해 클래스 추가
      mapRef.current.classList.add('map-loaded');
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-screen relative bg-[#0a0c10] overflow-hidden">
      {/* 1. Map Canvas Layer */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 z-0 transition-opacity duration-1000 opacity-0 [&.map-loaded]:opacity-100"
      />

      {/* 2. UI Overlay (Map Status) */}
      <div className="absolute bottom-32 left-8 z-20 pointer-events-none">
        <div className="backdrop-blur-xl bg-theme-bg/10 border border-theme-border/5 p-6 rounded-[2rem] inline-block pointer-events-auto shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Map Engine Live</span>
          </div>
          <h2 className="text-xl font-black text-white/90 tracking-tighter mb-1">Seoul Grid</h2>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
            Tile: CartoDB Dark Matter
          </p>
        </div>
      </div>

      {/* 3. Ambient Vignette (For Depth) */}
      <div className="absolute inset-0 pointer-events-none shadow-[inner_0_0_150px_rgba(0,0,0,0.5)] z-10" />
    </div>
  );
};

export default Main;
