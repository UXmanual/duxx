import React, { useEffect, useRef, useState } from 'react';

/**
 * [Page] 메인 페이지 (지도 엔진)
 * @version 2.4.0
 * @description 모든 지도 라벨을 배경색 없이 프리텐다드(Pretendard) 폰트로 직접 렌더링하도록 최적화된 버전입니다.
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

    if (mapRef.current) {
      mapRef.current.style.fontFamily = "'Pretendard', sans-serif";
    }

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

      // NO-LABELS 타일을 사용하여 수동으로 지명 제어
      const tileUrl = nightMode 
        ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png';

      tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 19, noWrap: false }).addTo(mapInstance.current);
      mapRef.current.classList.add('map-loaded');

      const createCustomLabel = (lat, lng, text, options = {}) => {
        const { size = 13, weight = 700 } = options;
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: `custom-map-label ${nightMode ? 'label-night' : 'label-day'}`,
            html: `<span>${text}</span>`,
            iconSize: [200, 40],
            iconAnchor: [100, 20]
          }),
          interactive: false,
          zIndexOffset: options.zIndex || 1000
        }).addTo(mapInstance.current);
        
        // 초기 폰트 스타일 강제 적용
        const el = marker.getElement();
        if (el) {
          const span = el.querySelector('span');
          if (span) {
            span.style.fontSize = `${size}px`;
            span.style.fontWeight = weight;
          }
        }
        
        return marker;
      };

      // 프리텐다드 폰트로 렌더링할 주요 지명
      labelsRef.current = [
        // 국가
        createCustomLabel(35.9, 127.7, '대한민국', { size: 16, weight: 800, zIndex: 2000 }),
        createCustomLabel(36.2, 138.2, '일본', { size: 16, weight: 800, zIndex: 2000 }),
        
        // 해역
        createCustomLabel(37.5, 131.5, '동해', { size: 13, weight: 700 }),
        createCustomLabel(36.0, 124.0, '서해', { size: 13, weight: 700 }),
        
        // 도시
        createCustomLabel(37.5665, 126.9780, '서울', { size: 12, weight: 600 }),
        createCustomLabel(35.1796, 129.0756, '부산', { size: 12, weight: 600 }),
        createCustomLabel(35.6895, 139.6917, '도쿄', { size: 12, weight: 600 })
      ];

      mapInstance.current.on('zoomend', () => {
        const zoom = mapInstance.current.getZoom();
        labelsRef.current.forEach(marker => {
          const el = marker.getElement();
          if (!el) return;
          const span = el.querySelector('span');
          if (!span) return;

          const text = span.innerText;
          const isCountry = ['대한민국', '일본'].includes(text);
          const isCity = ['서울', '부산', '도쿄'].includes(text);

          if (isCountry) {
            span.style.opacity = zoom >= 3 ? '1' : '0.4';
            span.style.transform = `scale(${Math.min(1.4, Math.max(0.8, zoom / 8))})`;
          } else if (isCity) {
            span.style.opacity = zoom >= 7 ? '1' : '0';
          } else {
            // 해역 (동해, 서해)
            if (zoom < 5 || zoom > 12) {
              span.style.opacity = '0';
            } else {
              span.style.opacity = '0.7';
              span.style.transform = `scale(${Math.min(1.2, zoom / 10)})`;
            }
          }
        });
      });
      
      mapInstance.current.fire('zoomend');
    }

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
      <div 
        ref={mapRef} 
        className="absolute inset-0 z-0 transition-opacity duration-1000 opacity-0 [&.map-loaded]:opacity-100"
      />
      <div className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-1000 ${isNight ? 'bg-black/20' : 'bg-amber-500/5'}`} />
    </div>
  );
};

export default Main;
