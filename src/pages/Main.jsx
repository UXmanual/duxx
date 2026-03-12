import React, { useEffect, useRef, useState } from 'react';

/**
 * [Page] 메인 페이지 (지도 엔진)
 * @version 1.9.3
 * @description 시간(KST)을 감지하여 지도의 테마를 자동으로 전환하며, 지도의 가로 무한 반복 및 세로 범위 제한이 적용된 버전입니다.
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
      // 세로(위도)는 제한하되, 가로(경도)는 무한히 반복될 수 있도록 설정
      const southWest = L.latLng(-85, -1000);
      const northEast = L.latLng(85, 1000);
      const bounds = L.latLngBounds(southWest, northEast);

      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 3, // 최소 줌 상향 (가로 비율이 깨지지 않고 꽉 차보이도록 조정)
        worldCopyJump: true, // 가로 무한 스크롤 시 좌표 보정
        maxBounds: bounds,
        maxBoundsViscosity: 1.0
      }).setView([37.5665, 126.9780], 13);

      // 초기 타일 설정
      const tileUrl = nightMode 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      tileLayerRef.current = L.tileLayer(tileUrl, { 
        maxZoom: 19,
        noWrap: false, // 가로 반복 허용 (잘림 방지)
      }).addTo(mapInstance.current);
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


      {/* 3. Global Depth Overlay */}
      <div className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-1000 ${isNight ? 'bg-black/20' : 'bg-amber-500/5'}`} />
    </div>
  );
};

export default Main;
