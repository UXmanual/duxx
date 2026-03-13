import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, MoonStar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * [Component] 상단 헤더 (배경 반전 강화 버전)
 * @version 10.4.0
 * @author Antigravity
 * @description 
 * - 레이어 분리를 유발하는 transition을 제거하고 순수 CSS 블렌딩에 집중했습니다.
 * - 지도의 픽셀과 직접 연산될 수 있도록 최상위 레이아웃 컨텍스트를 활용합니다.
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
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="w-full px-10 h-24 flex items-center justify-between">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Logo: 배경 반전 효과를 위한 전용 스타일 */}
          <span 
            className="font-black text-[24px] tracking-[0] uppercase select-none"
            style={{ 
              mixBlendMode: 'difference',
              color: '#ffffff',
              display: 'block'
            }}
          >
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
