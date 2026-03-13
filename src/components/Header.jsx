import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, MoonStar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * [Component] 상단 헤더
 * @version 10.2.0
 * @description 
 * - 로고에 'mix-blend-mode: difference'와 'text-white'를 적용하여 배경에 따라 색상이 반전되는 효과를 구현했습니다.
 * - 이 효과를 통해 지도가 움직일 때 로고 컬러가 동적으로 변하는 Photoshop의 블렌딩 모드 느낌을 줍니다.
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
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 pointer-events-none">
      <div className="w-full px-10 h-24 flex items-center justify-between">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Logo: font-size 24px, letter-spacing 0, mix-blend-mode + text-white (배경반전 핵심) */}
          <span className="font-black text-[24px] tracking-[0] uppercase mix-blend-difference text-white select-none">
            DUXX
          </span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-theme-card/30 hover:bg-theme-accent/10 transition-colors duration-500 group relative flex items-center justify-center w-12 h-12 pointer-events-auto"
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
