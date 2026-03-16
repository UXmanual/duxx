import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, MoonStar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * [Component] 상단 헤더
 * @version 19.7
 * @author Antigravity
 * @description
 * - 테마 토글 버튼의 배경 블러, 쉐도우, 배경색을 모두 제거하여 순수 아이콘만 노출되도록 했습니다.
 * - 터치 영역(w-12 h-12)은 유지하여 사용성을 확보했습니다.
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
        mix-blend-mode: color-burn (Light) / color-dodge (Dark)
      */}
      <div 
        className="absolute top-0 left-0 px-10 h-24 flex items-center z-10 pointer-events-none text-[#FF4D00]"
        style={{ mixBlendMode: isDark ? 'color-dodge' : 'color-burn' }}
      >
        <span className="logo-font text-[24px] tracking-[0] uppercase select-none pointer-events-auto">
          BABBLE
        </span>
      </div>

      {/* [Interface Layer] 테마 버튼 - 배경 및 쉐도우 제거 버전 */}
      <div className="absolute top-0 right-0 px-10 h-24 flex items-center z-20 pointer-events-none">
        <button 
          onClick={toggleTheme}
          className="p-3 bg-transparent transition-colors duration-500 group flex items-center justify-center w-12 h-12 pointer-events-auto"
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
