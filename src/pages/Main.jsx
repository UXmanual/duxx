import React, { useEffect, useRef, useState } from 'react';

/**
 * [Page] 메인 페이지 (지도 엔진)
 * @version 2.2.0
 * @description 시간(KST)을 감지하여 지도의 테마를 자동으로 전환하며, 기존 지명 정보를 유지하되 한국 해역 명칭만 커스텀 라벨(Pretendard 폰트)로 대체한 버전입니다.
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

    // 지도 컨테이너 기본 폰트 설정 (attribution 등)
    if (mapRef.current) {
      mapRef.current.style.fontFamily = "'Pretendard', sans-serif";
    }

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

      // 기존 지명이 포함된 표준 타일로 복구
      const tileUrl = nightMode 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 19, noWrap: false }).addTo(mapInstance.current);
      mapRef.current.classList.add('map-loaded');

      // 커스텀 라벨 및 마스킹 패치 생성
      const createCustomLabel = (lat, lng, text) => {
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: `custom-map-label ${nightMode ? 'label-night' : 'label-day'}`,
            html: `<span>${text}</span>`,
            iconSize: [140, 50], // 기존 라벨을 덮기 위해 마스크 크기 충분히 확보
            iconAnchor: [70, 25]
          }),
          interactive: false,
          zIndexOffset: 1000
        }).addTo(mapInstance.current);
        return marker;
      };

      labelsRef.current = [
        createCustomLabel(37.5, 132.5, '동해'), // 기존 표기 위치 고려 조정
        createCustomLabel(36.0, 124.0, '서해')
      ];

      // 줌 레벨에 따른 동적 가시성 및 스케일링
      mapInstance.current.on('zoomend', () => {
        const zoom = mapInstance.current.getZoom();
        labelsRef.current.forEach(marker => {
          const el = marker.getElement();
          if (!el) return;
          const span = el.querySelector('span');
          if (!span) return;

          if (zoom < 5) {
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
          } else {
            el.style.opacity = '1';
            const scale = Math.min(1.4, Math.max(0.8, zoom / 10));
            span.style.fontSize = `${14 * scale}px`;
          }
        });
      });
      
      mapInstance.current.fire('zoomend');
    }

    // 테마 변경 시 타일 및 라벨 스타일 동기화
    if (labelsRef.current.length > 0) {
      labelsRef.current.forEach(marker => {
        const currentIcon = marker.getIcon();
        const textMatch = currentIcon.options.html.match(/<span>(.*?)<\/span>|<span[^>]*>(.*?)<\/span>/);
        const text = textMatch ? (textMatch[1] || textMatch[2]) : '해역';
        marker.setIcon(L.divIcon({
          ...currentIcon.options,
          className: `custom-map-label ${isNight ? 'label-night' : 'label-day'}`,
          html: `<span>${text}</span>`
        }));
      });
      mapInstance.current.fire('zoomend');
    }

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
