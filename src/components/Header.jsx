import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * [Component] 상단 헤더 (실시간 날씨 API 연동 버전)
 * @version 26.2
 * @author Antigravity
 */
const Header = () => {
  const [weather, setWeather] = useState('sunny');
  const [temp, setTemp] = useState(20);
  const [locationName, setLocationName] = useState('위치 확인 중...');

  // Weather Code Mapping (Open-Meteo 기준)
  const mapWeatherCode = (code) => {
    if (code === 0) return 'sunny';
    if ([1, 2, 3, 45, 48].includes(code)) return 'cloudy';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) return 'rainy';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snowy';
    return 'sunny';
  };

  const fetchWeather = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
      );
      const data = await response.json();
      if (data.current_weather) {
        setWeather(mapWeatherCode(data.current_weather.weathercode));
        setTemp(Math.round(data.current_weather.temperature));
        setLocationName('실시간 날씨');
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
    }
  };

  useEffect(() => {
    // 1. 사용자 위치 확인
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // 위치 권한 거부 시 서울 기준 (37.5665, 126.9780)
          fetchWeather(37.5665, 126.9780);
          setLocationName('서울');
        }
      );
    } else {
      fetchWeather(37.5665, 126.9780);
      setLocationName('서울');
    }

    // 2. 30분마다 날씨 갱신
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition((p) => fetchWeather(p.coords.latitude, p.coords.longitude));
    }, 1800000);
    
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = () => {
    switch (weather) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-400" fill="currentColor" />;
      case 'cloudy': return <Cloud className="w-6 h-6 text-gray-400" fill="currentColor" />;
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-400" />;
      case 'snowy': return <CloudSnow className="w-6 h-6 text-blue-200" />;
      case 'windy': return <Wind className="w-6 h-6 text-teal-400" />;
      default: return <Sun className="w-6 h-6 text-yellow-400" />;
    }
  };

  const getWeatherMotion = () => {
    switch (weather) {
      case 'sunny': return { rotate: 360, scale: [1, 1.1, 1] };
      case 'cloudy': return { x: [-2, 2, -2], y: [-1, 1, -1] };
      case 'rainy': return { y: [0, 3, 0] };
      case 'snowy': return { opacity: [0.7, 1, 0.7], scale: [0.9, 1, 0.9] };
      case 'windy': return { x: [-5, 5, -5], skewX: [-5, 5, -5] };
      default: return {};
    }
  };

  return (
    <header style={{ display: 'contents' }}>
      <div className="absolute top-0 left-0 px-10 h-24 flex items-center z-10 pointer-events-none text-[#FF4D00]">
        <span className="logo-font text-[24px] tracking-[0] uppercase select-none pointer-events-auto">
          BABBLE
        </span>
      </div>

      {/* [Weather Widget Layer] */}
      <div className="absolute top-0 right-0 px-10 h-24 flex items-center z-20 pointer-events-none">
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm pointer-events-auto cursor-default border border-orange-50">
            <AnimatePresence mode="wait">
              <motion.div
                key={weather}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={getWeatherMotion()}
                  transition={{ duration: weather === 'sunny' ? 15 : 3, repeat: Infinity, ease: "linear" }}
                >
                  {getWeatherIcon()}
                </motion.div>
                <span className="text-[14px] font-bold text-zinc-800 tracking-tight">
                  {temp}°C
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
