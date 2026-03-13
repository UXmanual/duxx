import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, MoonStar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * [Component] 상단 헤더
 * @version 11.3.0
 * @description
 * - 'display: contents'를 사용하여 시맨틱 태그는 유지하되 레이아웃 엔진에서는 하위 요소를 루트로 승격시켰습니다.
 * - 이로써 로고가 지도와 직접 블렌딩(Overlay)될 수 있는 환경을 선사합니다.
 */
const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const [moonPhase, setMoonPhase] = useState(0);

  useEffect(() => {
    if (!isDark) {
      const interval = setInterval(() => {
        setMoonPhase((prev) => (prev + 1) % 3);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isDark]);

  return (
    <header style={{ display: 'contents' }}>
      {/* 
        [Logo Layer] 
        z-index: 10으로 지도 위에 뜨면서도, 
        부모의 스태킹 격리가 없어 지도 배경과 Overlay 블렌딩이 작동합니다.
      */}
      <div className="absolute top-0 left-0 px-10 h-24 flex items-center z-10 pointer-events-none">
        <span 
          className="font-black text-[24px] tracking-[0] uppercase select-none pointer-events-auto"
          style={{ mixBlendMode: 'overlay', color: 'inherit' }}
        >
          DUXX
        </span>
      </div>

      {/* [Interface Layer] 테마 버튼 */}
      <div className="absolute top-0 right-0 px-10 h-24 flex items-center z-20 pointer-events-none">
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-theme-card/30 hover:bg-theme-accent/10 transition-colors duration-500 group flex items-center justify-center w-12 h-12 pointer-events-auto shadow-sm backdrop-blur-sm"
          aria-label="Toggle Theme"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isDark ? 'dark' : `light-${moonPhase}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 flex items-center justify-center text-[#FACC15]"
            >
              {isDark ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                >
                  <Sun className="w-6 h-6" fill="currentColor" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  {moonPhase === 0 && <Moon className="w-6 h-6" fill="currentColor" />}
                  {moonPhase === 1 && <MoonStar className="w-6 h-6" fill="currentColor" />}
                  {moonPhase === 2 && (
                    <div className="w-5 h-5 rounded-full bg-current shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>
    </header>
  );
};

export default Header;
