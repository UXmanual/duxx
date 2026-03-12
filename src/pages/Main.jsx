import React, { useEffect, useRef, useState } from 'react';

/**
 * [Page] 메인 페이지 (지도 엔진)
 * @version 2.1.2
 * @description 시간(KST)을 감지하여 지도의 테마를 자동으로 전환하며, 줌 레벨에 따라 해역 라벨의 가시성 및 크기가 조절되는 버전입니다.
 */
const Main = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const tileLayerRef = useRef(null);
  const labelsRef = useRef([]);
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    if (!window.L) return;
    const L = window.L;

    // 현재 시간에 따른 낮/밤 판단
    const checkDayNight = () => {
      const hour = new Date().getHours();
      return hour < 7 || hour >= 19;
    };

    const nightMode = checkDayNight();
    setIsNight(nightMode);

    if (!mapInstance.current) {
      const southWest = L.latLng(-85, -1000);
      const northEast = L.latLng(85, 1000);
      const bounds = L.latLngBounds(southWest, northEast);

      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 3, 
        worldCopyJump: true,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0
      }).setView([37.5665, 126.9780], 13);

      const tileUrl = nightMode 
        ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png';

      tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 19, noWrap: false }).addTo(mapInstance.current);
      mapRef.current.classList.add('map-loaded');

      const createCustomLabel = (lat, lng, text) => {
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: `custom-map-label ${nightMode ? 'label-night' : 'label-day'}`,
            html: `<span style="opacity: 1; font-size: 14px;">${text}</span>`,
            iconSize: [120, 40],
            iconAnchor: [60, 20]
          }),
          interactive: false,
          zIndexOffset: 1000
        }).addTo(mapInstance.current);
        return marker;
      };

      labelsRef.current = [
        createCustomLabel(38.0, 131.5, '동해'),
        createCustomLabel(36.0, 124.0, '서해')
      ];

      // 줌 레벨에 따른 라벨 가시성 제어
      mapInstance.current.on('zoomend', () => {
        const zoom = mapInstance.current.getZoom();
        labelsRef.current.forEach(marker => {
          const el = marker.getElement();
          if (!el) return;
          const span = el.querySelector('span');
          if (!span) return;

          // 줌 5 미만에서는 숨김, 그 이상에서는 점진적으로 크기 조절
          if (zoom < 5) {
            span.style.opacity = '0';
            span.style.transform = 'scale(0.5)';
          } else {
            const scale = Math.min(1.5, Math.max(0.8, zoom / 10)); // 줌에 따른 크기 배율
            span.style.opacity = '1';
            span.style.fontSize = `${14 * scale}px`;
            span.style.transform = 'scale(1)';
          }
        });
      });
      
      // 초기 줌 상태 반영
      mapInstance.current.fire('zoomend');
    }

    // 테마 변경 시 라벨 스타일 업데이트
    if (labelsRef.current.length > 0) {
      labelsRef.current.forEach(marker => {
        const currentIcon = marker.getIcon();
        const textMatch = currentIcon.options.html.match(/<span>(.*?)<\/span>|<span[^>]*>(.*?)<\/span>/);
        const text = textMatch[1] || textMatch[2];
        marker.setIcon(L.divIcon({
          ...currentIcon.options,
          className: `custom-map-label ${isNight ? 'label-night' : 'label-day'}`,
          html: `<span style="transition: all 0.5s ease;">${text}</span>`
        }));
      });
      mapInstance.current.fire('zoomend');
    }

    // 시간 변화 감지 및 타일 전환 로직 (기존 로직 유지)
    const interval = setInterval(() => {
      const currentNightState = checkDayNight();
      if (currentNightState !== isNight) {
        setIsNight(currentNightState);
        const newUrl = currentNightState 
          ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png';
        
        if (tileLayerRef.current) {
          tileLayerRef.current.setUrl(newUrl);
        }
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        labelsRef.current = [];
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
