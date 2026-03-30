import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ isSearchOpen = false, onSearchToggle = null }) => {
  const [weather, setWeather] = useState(null);
  const [temp, setTemp] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          fetchWeather(37.5665, 126.978);
        }
      );
    } else {
      fetchWeather(37.5665, 126.978);
    }

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition((position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
      });
    }, 1800000);

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = () => {
    switch (weather) {
      case 'sunny':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="relative flex items-center justify-center"
          >
            <Sun className="h-6 w-6 text-yellow-400" fill="currentColor" fillOpacity={0.4} />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute h-8 w-8 rounded-full bg-yellow-400/20 blur-md"
            />
          </motion.div>
        );
      case 'cloudy':
        return (
          <motion.div
            animate={{ x: [-2, 2, -2], y: [-1, 1, -1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Cloud className="h-6 w-6 text-gray-400" fill="currentColor" fillOpacity={0.8} />
          </motion.div>
        );
      case 'rainy':
        return (
          <div className="relative">
            <motion.div animate={{ y: [-1, 1, -1] }} transition={{ duration: 2, repeat: Infinity }}>
              <CloudRain className="h-6 w-6 text-blue-400" />
            </motion.div>
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 0, x: index * 4 - 4 }}
                animate={{ opacity: [0, 1, 0], y: [4, 12], x: index * 4 - 6 }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: 'linear'
                }}
                className="absolute left-1/2 top-4 h-[4px] w-[2px] rounded-full bg-blue-300"
              />
            ))}
          </div>
        );
      case 'snowy':
        return (
          <div className="relative">
            <motion.div animate={{ scale: [0.95, 1.05, 0.95] }} transition={{ duration: 3, repeat: Infinity }}>
              <CloudSnow className="h-6 w-6 text-blue-200" />
            </motion.div>
            {[0, 1].map((index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 0, x: index * 10 - 5 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [4, 14],
                  x: [index * 10 - 5, index * 10 - 8, index * 10 - 3]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: index,
                  ease: 'easeInOut'
                }}
                className="absolute left-1/2 top-4 h-[3px] w-[3px] rounded-full bg-white shadow-[0_0_5px_#fff]"
              />
            ))}
          </div>
        );
      case 'windy':
        return (
          <motion.div
            animate={{ x: [-3, 3, -3], skewX: [-10, 10, -10] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Wind className="h-6 w-6 text-teal-400" />
          </motion.div>
        );
      default:
        return <Sun className="h-6 w-6 text-yellow-400" />;
    }
  };

  return (
    <header style={{ display: 'contents' }}>
      <div
        className="absolute left-0 hidden h-24 items-center px-10 text-[#FF4D00] pointer-events-none z-[10]"
        style={{ top: 'env(safe-area-inset-top, 0px)' }}
      >
        <span className="logo-font pointer-events-auto select-none text-[24px] uppercase tracking-[0]">
          BABBLE
        </span>
      </div>

      <div
        className="absolute right-0 flex h-24 items-center px-10 pointer-events-none z-[20]"
        style={{ top: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSearchToggle}
              aria-label="검색 열기"
              aria-expanded={isSearchOpen}
              className="pointer-events-auto flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white text-zinc-800 transition-all"
            >
              <Search size={18} strokeWidth={2.4} />
            </button>

            <div className="flex h-[40px] min-w-[90px] items-center justify-center gap-3 overflow-hidden rounded-full bg-white px-4 py-2 pointer-events-auto">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex w-full items-center gap-2"
                  >
                    <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-4 w-10 animate-pulse rounded-md bg-gray-100" />
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
                    <div className="relative flex h-8 w-8 items-center justify-center">
                      {getWeatherIcon()}
                    </div>
                    <span className="text-[14px] font-bold tracking-tight text-zinc-800">
                      {temp}°C
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
