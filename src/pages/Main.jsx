import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudRain, Sun, Moon, Wind, CloudSnow } from 'lucide-react';

/**
 * [Weather Engine] Live Weather & Day/Night System
 * @description 외부 라이브러리 없이 순수 CSS와 Framer Motion으로 구현한 고화질 기상 엔진입니다.
 */

// 날씨별 입자(Particle) 컴포넌트
const RainDrop = ({ delay }) => (
  <motion.div
    initial={{ y: -10, opacity: 0 }}
    animate={{ 
      y: ['0vh', '110vh'],
      opacity: [0, 1, 0]
    }}
    transition={{ 
      duration: 1, 
      repeat: Infinity, 
      ease: "linear",
      delay: delay 
    }}
    className="absolute w-[1.5px] h-8 bg-blue-400/40 rounded-full"
    style={{ left: `${Math.random() * 100}%` }}
  />
);

const SnowFlake = ({ delay }) => (
  <motion.div
    initial={{ y: -10, opacity: 0 }}
    animate={{ 
      y: ['0vh', '110vh'],
      x: ['0vw', `${(Math.random() - 0.5) * 10}vw`],
      opacity: [0, 1, 0],
      rotate: 360
    }}
    transition={{ 
      duration: 5 + Math.random() * 5, 
      repeat: Infinity, 
      ease: "linear",
      delay: delay 
    }}
    className="absolute w-2 h-2 bg-white/60 rounded-full blur-[1px]"
    style={{ left: `${Math.random() * 100}%` }}
  />
);

const Main = () => {
  const [weather, setWeather] = useState('clear'); // clear, rain, snow, clouds
  const [isNight, setIsNight] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 시간 및 낮/밤 감지 로직
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const hour = now.getHours();
      setIsNight(hour < 6 || hour >= 18);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`w-full h-screen relative transition-colors duration-1000 overflow-hidden ${
      isNight ? 'bg-[#0a0c14]' : 'bg-[#f0f4f8]'
    }`}>
      
      {/* 1. Background Atmosphere (Ambient Light) */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${
        isNight ? 'opacity-40' : 'opacity-20'
      }`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vmax] h-[150vmax] 
          bg-[radial-gradient(circle,var(--theme-accent)_0%,transparent_70%)] opacity-20 blur-[100px]" />
      </div>

      {/* 2. Map Layer (Placeholder / Mock Map) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40">
        <svg width="100%" height="100%" viewBox="0 0 1000 500" className={`transition-colors duration-1000 ${
          isNight ? 'fill-slate-800' : 'fill-slate-300'
        }`}>
          {/* 단순화된 세계 지도 경로 (추후 상세 지도로 교체 가능) */}
          <path d="M150,200 Q200,150 250,200 T350,200 T450,250 T550,200 T650,250 T750,200 T850,250 T950,200 V400 H50 Z" />
          <p className="text-xs font-bold uppercase tracking-[1em] text-slate-500">Live Viewport Engine v1.5</p>
        </svg>
      </div>

      {/* 3. Weather Particles Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <AnimatePresence>
          {weather === 'rain' && Array.from({ length: 80 }).map((_, i) => (
            <RainDrop key={`rain-${i}`} delay={Math.random() * 2} />
          ))}
          {weather === 'snow' && Array.from({ length: 50 }).map((_, i) => (
            <SnowFlake key={`snow-${i}`} delay={Math.random() * 5} />
          ))}
        </AnimatePresence>
      </div>

      {/* 4. Weather Status Display Card (Glass) */}
      <div className="absolute bottom-32 left-8 z-20 backdrop-blur-xl bg-theme-bg/40 border border-theme-border/20 p-8 rounded-[40px] shadow-2xl w-80 group hover:bg-theme-bg/60 transition-all">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 rounded-3xl bg-theme-accent text-white shadow-lg shadow-theme-accent/30">
            {weather === 'clear' && (isNight ? <Moon className="w-8 h-8" /> : <Sun className="w-8 h-8" />)}
            {weather === 'rain' && <CloudRain className="w-8 h-8" />}
            {weather === 'snow' && <CloudSnow className="w-8 h-8" />}
            {weather === 'clouds' && <Cloud className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="text-xl font-black text-theme-text-primary capitalize tracking-tight">
              {weather}
            </h2>
            <p className="text-[10px] font-bold text-theme-accent uppercase tracking-widest">
              Live updates
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-theme-border/10 pb-4">
            <span className="text-3xl font-black text-theme-text-primary">12°C</span>
            <span className="text-xs font-bold text-theme-text-secondary opacity-60">Seoul, South Korea</span>
          </div>
          
          {/* Quick Simulation Toggles (For Preview Only) */}
          <div className="flex gap-2 pt-2">
            {['clear', 'rain', 'snow'].map((w) => (
              <button
                key={w}
                onClick={() => setWeather(w)}
                className={`flex-1 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${
                  weather === w 
                    ? 'bg-theme-accent text-white' 
                    : 'bg-theme-card/30 text-theme-text-secondary hover:bg-theme-card/50'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Time & Date Indicator */}
      <div className="absolute bottom-32 right-8 z-20 text-right">
        <h3 className="text-5xl font-black text-theme-text-primary tracking-tighter tabular-nums leading-none mb-2">
          {currentTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </h3>
        <p className="text-[11px] font-black text-theme-accent uppercase tracking-[0.4em] opacity-80">
          {isNight ? 'Night Mode Active' : 'Daylight Cycle'}
        </p>
      </div>

    </div>
  );
};

export default Main;
