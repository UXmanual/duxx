import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useTheme } from '../context/ThemeContext';

/**
 * [Page] 메인 페이지 (구글 맵 엔진)
 * @version 3.6.0
 * @description 프리미엄 다크 모드가 적용된 구글 맵입니다. 
 * 접속 시 브라우저 Geolocation API를 사용하여 사용자의 현위치를 자동으로 감지하고 기본 줌(Zoom 14)을 제공합니다.
 */

const containerStyle = {
  width: '100%',
  height: '100vh',
  backgroundColor: '#0a1016'
};

const defaultCenter = {
  lat: 37.5665,
  lng: 126.9780
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

// 프리미엄 구글 맵 커스텀 스타일 (High-End Dark Mode)
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }],
  },
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334e87" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#023e58" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#283d6a" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6f9ba5" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#023e58" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3C7680" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#98a5be" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2c6675" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#255762" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#b0d5ce" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#023e58" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#98a5be" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry.fill",
    stylers: [{ color: "#283d6a" }],
  },
  {
    featureType: "transit.station",
    elementType: "geometry.fill",
    stylers: [{ color: "#3a4762" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4e6d70" }],
  },
];

const Main = () => {
  const { isDark } = useTheme();
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(7);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    language: 'ko',
    region: 'KR'
  });

  // 현위치 감지 로직
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter({ lat: latitude, lng: longitude });
          setMapZoom(14); // 현위치 발견 시 기본줌
        },
        () => {
          console.warn("Geolocation access denied or failed. Using default center.");
        }
      );
    }
  }, []);

  return (
    <div className={`w-full h-screen relative overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-[#0a0c10]' : 'bg-[#f4f7f9]'}`}>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={mapZoom}
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
