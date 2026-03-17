import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * [Component] 상단 헤더 (날씨 위젯 통합 버전)
 * @version 24.0
 * @author Antigravity
 */
const Header = () => {
  const [weather, setWeather] = useState('sunny'); // sunny, cloudy, rainy, snowy
  const [temp, setTemp] = useState(22);

  // 시뮬레이션을 위해 10초마다 날씨 랜덤 변경 (실제 구현 시 API 연동 가능)
  useEffect(() => {
    const weatherList = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
    const interval = setInterval(() => {
      const randomWeather = weatherList[Math.floor(Math.random() * weatherList.length)];
      setWeather(randomWeather);
      setTemp(Math.floor(Math.random() * 15) + 10);
    }, 15000);
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
      <div className="absolute top-0 left-0 px-10 h-24 flex items-center z-10 pointer-events-none text-[#FF4D00] multiply">
        <span className="logo-font text-[24px] tracking-[0] uppercase select-none pointer-events-auto">
          BABBLE
        </span>
      </div>

      {/* [Weather Widget Layer] */}
      <div className="absolute top-0 right-0 px-10 h-24 flex items-center z-20 pointer-events-none">
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full shadow-sm pointer-events-auto cursor-default">
          <AnimatePresence mode="wait">
            <motion.div
              key={weather}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={getWeatherMotion()}
                transition={{ duration: weather === 'sunny' ? 10 : 3, repeat: Infinity, ease: "linear" }}
              >
                {getWeatherIcon()}
              </motion.div>
              <span className="text-[14px] font-bold text-zinc-700 tracking-tight">
                {temp}°C
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
