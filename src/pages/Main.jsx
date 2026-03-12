import React, { useEffect, useRef, useState } from 'react';

/**
 * [Page] 메인 페이지 (지도 엔진)
 * @version 2.3.0
 * @description 모든 지도 라벨을 프리텐다드(Pretendard) 폰트로 직접 렌더링하도록 커스터마이징된 버전입니다.
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

      // 전체 지명을 제거한 No-Labels 타일 사용 (우리가 직접 텍스트를 적기 위함)
      const tileUrl = nightMode 
        ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png';

      tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 19, noWrap: false }).addTo(mapInstance.current);
      mapRef.current.classList.add('map-loaded');

      // 커스텀 라벨 통합 생성 함수
      const createCustomLabel = (lat, lng, text, options = {}) => {
        const { size = 14, weight = 800, opacity = 1, letterSpacing = '0.15em' } = options;
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: `custom-map-label ${nightMode ? 'label-night' : 'label-day'}`,
            html: `<span style="font-size: ${size}px; font-weight: ${weight}; letter-spacing: ${letterSpacing}; opacity: ${opacity};">${text}</span>`,
            iconSize: [160, 40],
            iconAnchor: [80, 20]
          }),
          interactive: false,
          zIndexOffset: options.zIndex || 1000
        }).addTo(mapInstance.current);
        return marker;
      };

      // 주요 지명 데이터셋 (프리텐다드 폰트로 직접 렌더링)
      labelsRef.current = [
        // 주요 해역
        createCustomLabel(37.5, 131.5, '동해', { size: 14, weight: 900 }),
        createCustomLabel(36.0, 124.0, '서해', { size: 14, weight: 900 }),
        
        // 국가 (줌아웃 시에도 유지될 주요 포인트)
        createCustomLabel(35.9, 127.7, '대한민국', { size: 18, weight: 900, zIndex: 2000 }),
        createCustomLabel(36.2, 138.2, '일본', { size: 18, weight: 900, zIndex: 2000 }),
        
        // 주요 도시 (확대 시 더 명확해짐)
        createCustomLabel(37.5665, 126.9780, '서울', { size: 12, weight: 700 }),
        createCustomLabel(35.1796, 129.0756, '부산', { size: 12, weight: 700 }),
        createCustomLabel(35.6895, 139.6917, '도쿄', { size: 12, weight: 700 })
      ];

      mapInstance.current.on('zoomend', () => {
        const zoom = mapInstance.current.getZoom();
        labelsRef.current.forEach(marker => {
          const el = marker.getElement();
          if (!el) return;
          const span = el.querySelector('span');
          if (!span) return;

          // 지명 성격에 따른 동적 가시성 제어
          const text = span.innerText;
          const isCountry = ['대한민국', '일본'].includes(text);
          const isCity = ['서울', '부산', '도쿄'].includes(text);

          if (isCountry) {
            span.style.opacity = zoom >= 3 ? '1' : '0.5';
            span.style.fontSize = `${18 * Math.min(1.3, zoom / 8)}px`;
          } else if (isCity) {
            span.style.opacity = zoom >= 7 ? '1' : '0';
          } else {
            // 해역 자막 (동해, 서해)
            if (zoom < 5 || zoom > 12) {
              span.style.opacity = '0';
            } else {
              span.style.opacity = '1';
              span.style.fontSize = `${14 * Math.min(1.4, zoom / 10)}px`;
            }
          }
        });
      });
      
      mapInstance.current.fire('zoomend');
    }

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
