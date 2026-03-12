import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useTheme } from '../context/ThemeContext';

/**
 * [Page] 메인 페이지 (구글 맵 엔진)
 * @version 3.4.0
 * @description 구글 맵 기본 라벨을 사용하며, region: 'KR' 설정을 통해 한국 지명을 우선적으로 표시합니다.
 * (주의: 구글 정책상 '서해' 대신 '황해'가 기본 표기되는 것은 엔진 고유 특성입니다.)
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

// 구글 맵 커스텀 스타일 (다크 모드용)
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1a1c1e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1c1e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#334155" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "road", stylers: [{ visibility: "simplified" }, { color: "#334155" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] }
];

const Main = () => {
  const { isDark } = useTheme();
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    language: 'ko',
    region: 'KR' // 한국 지역 설정 (동해 명칭 및 독도 표기 최적화)
  });

  return (
    <div className={`w-full h-screen relative overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-[#0a0c10]' : 'bg-[#f4f7f9]'}`}>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={7}
          options={{
            disableDefaultUI: true,
            minZoom: 3,
            maxZoom: 18,
            restriction: mapBoundsRestriction,
            styles: isDark ? darkMapStyles : [],
            gestureHandling: 'greedy',
            backgroundColor: isDark ? '#0a1016' : '#f4f7f9'
          }}
        />
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
