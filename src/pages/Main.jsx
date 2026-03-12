import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, OverlayView } from '@react-google-maps/api';
import { useTheme } from '../context/ThemeContext';

/**
 * [Page] 메인 페이지 (구글 맵 엔진)
 * @version 3.3.0
 * @description Google Maps SDK를 사용하여 한국 해역 명칭(동해, 서해)을 커스텀 라벨로 정확히 표기한 프리미엄 버전입니다.
 */

const containerStyle = {
  width: '100%',
  height: '100vh',
  backgroundColor: '#0a0c10'
};

const center = {
  lat: 36.5,
  lng: 127.5
};

const mapBoundsRestriction = {
  latLngBounds: {
    north: 85,
    south: -85,
    west: -180,
    east: 180
  },
  strictBounds: false
};

// 해역 라벨 좌표 데이터
const seaLabels = [
  { id: 'east-sea', name: '동해', position: { lat: 37.5, lng: 131.5 } },
  { id: 'west-sea', name: '서해', position: { lat: 36.5, lng: 124.5 } }
];

// 구글 맵 커스텀 스타일 (다크 모드용)
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1a1c1e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1c1e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#334155" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "road", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] }
];

const Main = () => {
  const { isDark } = useTheme();
  const [map, setMap] = useState(null);
  const [zoom, setZoom] = useState(6);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    language: 'ko'
  });

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onZoomChanged = () => {
    if (map) {
      setZoom(map.getZoom());
    }
  };

  return (
    <div className={`w-full h-screen relative overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-[#0a0c10]' : 'bg-[#f4f7f9]'}`}>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={6}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onZoomChanged={onZoomChanged}
          options={{
            disableDefaultUI: true,
            minZoom: 3,
            maxZoom: 18,
            restriction: mapBoundsRestriction,
            styles: isDark ? darkMapStyles : [],
            gestureHandling: 'greedy',
            backgroundColor: isDark ? '#0a1016' : '#f4f7f9'
          }}
        >
          {/* 해역 커스텀 라벨 렌더링 (SDK의 OverlayView 방식 사용) */}
          {seaLabels.map((label) => (
            <OverlayView
              key={label.id}
              position={label.position}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div 
                style={{
                  transform: `scale(${Math.min(1.5, Math.max(0.7, zoom / 8))})`,
                  opacity: zoom > 4 && zoom < 12 ? 1 : 0,
                  transition: 'all 0.4s ease',
                  pointerEvents: 'none'
                }}
              >
                <span className={`
                  whitespace-nowrap font-bold tracking-[0.2em] text-[15px] block
                  ${isDark ? 'text-white/70' : 'text-slate-700/80'}
                `}
                style={{
                  fontFamily: 'Pretendard',
                  textShadow: isDark 
                    ? '0 0 10px rgba(0,0,0,0.8)' 
                    : '0 0 10px rgba(255,255,255,0.8)'
                }}>
                  {label.name}
                </span>
              </div>
            </OverlayView>
          ))}
        </GoogleMap>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/5 font-black text-6xl animate-pulse tracking-tighter">
          DUXX ENGINE
        </div>
      )}
      
      {/* Global Depth Overlay */}
      <div className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-1000 ${isDark ? 'bg-black/5' : 'bg-transparent'}`} />
    </div>
  );
};

export default Main;
