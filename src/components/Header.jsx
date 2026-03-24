import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * [Component] 상단 헤더 (실시간 날씨 API 연동 버전)
 * @version 32.3
 * @author Antigravity
 */
const Header = () => {
  const [weather, setWeather] = useState(null);
  const [temp, setTemp] = useState(null);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
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
      case 'sunny':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="relative flex items-center justify-center"
          >
            <Sun className="w-6 h-6 text-yellow-400" fill="currentColor" fillOpacity={0.4} />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-8 h-8 bg-yellow-400/20 rounded-full blur-md"
            />
          </motion.div>
        );
      case 'cloudy':
        return (
          <motion.div
            animate={{ x: [-2, 2, -2], y: [-1, 1, -1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Cloud className="w-6 h-6 text-gray-400" fill="currentColor" fillOpacity={0.8} />
          </motion.div>
        );
      case 'rainy':
        return (
          <div className="relative">
            <motion.div
              animate={{ y: [-1, 1, -1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CloudRain className="w-6 h-6 text-blue-400" />
            </motion.div>
            {/* 빗방울 디테일 모션 */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0, x: i * 4 - 4 }}
                animate={{ opacity: [0, 1, 0], y: [4, 12], x: i * 4 - 4 - 2 }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity, 
                  delay: i * 0.2,
                  ease: "linear" 
                }}
                className="absolute top-4 left-1/2 w-[2px] h-[4px] bg-blue-300 rounded-full"
              />
            ))}
          </div>
        );
      case 'snowy':
        return (
          <div className="relative">
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <CloudSnow className="w-6 h-6 text-blue-200" />
            </motion.div>
            {/* 눈송이 디테일 모션 */}
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0, x: i * 10 - 5 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  y: [4, 14], 
                  x: [i * 10 - 5, i * 10 - 8, i * 10 - 3] 
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  delay: i * 1,
                  ease: "easeInOut" 
                }}
                className="absolute top-4 left-1/2 w-[3px] h-[3px] bg-white rounded-full shadow-[0_0_5px_#fff]"
              />
            ))}
          </div>
        );
      case 'windy':
        return (
          <motion.div
            animate={{ x: [-3, 3, -3], skewX: [-10, 10, -10] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Wind className="w-6 h-6 text-teal-400" />
          </motion.div>
        );
      default:
        return <Sun className="w-6 h-6 text-yellow-400" />;
    }
  };

  return (
    <header style={{ display: 'contents' }}>
      <div 
        className="absolute left-0 px-10 h-24 hidden items-center z-[10] pointer-events-none text-[#FF4D00]"
        style={{ top: 'env(safe-area-inset-top, 0px)' }}
      >
        <span className="logo-font text-[24px] tracking-[0] uppercase select-none pointer-events-auto">
          BABBLE
        </span>
      </div>

      {/* [Weather Widget Layer] */}
      <div 
        className="absolute right-0 px-10 h-24 flex items-center z-[20] pointer-events-none"
        style={{ top: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full pointer-events-auto cursor-default min-w-[90px] h-[40px] justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {loading ? (
                /* 스켈레톤 로딩 바 (v32.3) */
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 w-full"
                >
                  <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
                  <div className="w-10 h-4 bg-gray-100 rounded-md animate-pulse" />
                </motion.div>
              ) : (
                <motion.div
                  key={weather}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex items-center justify-center w-8 h-8">
                    {getWeatherIcon()}
                  </div>
                  <span className="text-[14px] font-bold text-zinc-800 tracking-tight">
                    {temp}°C
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
