import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

/**
 * [Page] 메인 페이지 (구글 맵 엔진)
 * @version 3.1.0
 * @description Google Maps JavaScript SDK를 사용하여 구축된 인터랙티브 지도입니다. 
 * 아이프레임(iframe) 방식이 아닌 SDK 방식이므로 더 빠른 렌더링과 정교한 커스텀 스타일링을 제공합니다.
 * 줌 아웃 시 화면이 잘리는 현상을 방지하기 위해 최소 줌(minZoom)과 이동 제한(restriction)을 적용했습니다.
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
  const [isNight, setIsNight] = useState(false);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    language: 'ko'
  });

  useEffect(() => {
    const checkDayNight = () => {
      const hour = new Date().getHours();
      return hour < 7 || hour >= 19;
    };
    
    setIsNight(checkDayNight());
    const interval = setInterval(() => setIsNight(checkDayNight()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-[#0a0c10]">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          options={{
            disableDefaultUI: true,
            minZoom: 3, // 너무 멀리 줌아웃되어 화면이 잘리는 현상 방지
            maxZoom: 18,
            restriction: mapBoundsRestriction, // 세로(위아래) 한계선 설정
            styles: isNight ? darkMapStyles : [],
            gestureHandling: 'greedy',
            backgroundColor: isNight ? '#0a1016' : '#f4f7f9'
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/10 font-black text-6xl animate-pulse tracking-tighter">
          DUXX ENGINE
        </div>
      )}
      
      {/* Global Depth Overlay */}
      <div className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-1000 ${isNight ? 'bg-black/10' : 'bg-transparent'}`} />
    </div>
  );
};

export default Main;
