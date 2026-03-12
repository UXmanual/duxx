import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useTheme } from '../context/ThemeContext';

/**
 * [Page] 메인 페이지 (구글 맵 엔진)
 * @version 3.2.0
 * @description Google Maps JS SDK를 사용하며, 전역 테마(ThemeProvider)와 연동되어 실시간으로 다크/라이트 모드가 전환됩니다.
 */

const containerStyle = {
  width: '100%',
  height: '100vh',
  backgroundColor: '#0a0c10'
};

const center = {
  lat: 37.5665,
  lng: 126.9780
};

// 위아래 화면 잘림 방지를 위한 이동 제한 구역 (Latitude 제한)
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
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const Main = () => {
  const { isDark } = useTheme();
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    language: 'ko'
  });

  return (
    <div className={`w-full h-screen relative overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-[#0a0c10]' : 'bg-[#f4f7f9]'}`}>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
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
      <div className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-1000 ${isDark ? 'bg-black/10' : 'bg-transparent'}`} />
    </div>
  );
};

export default Main;
