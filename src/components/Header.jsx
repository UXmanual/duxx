import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, MoonStar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * [Component] 상단 헤더
 * @description 블러 처리와 배경색을 제거한 투명한 레이아웃의 헤더 컴포넌트입니다.
 * 버전 4.1.0: 테마 아이콘에 생동감 넘치는 애니메이션(자전하는 태양, 위상 변화하는 달)과 비비드한 컬러를 적용했습니다.
 */
const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const [moonPhase, setMoonPhase] = useState(0);

  // 달 위상 변화를 위한 타이머
  useEffect(() => {
    if (!isDark) { // 현재 라이트 모드(달 아이콘 표시 중)일 때만 작동
      const interval = setInterval(() => {
        setMoonPhase((prev) => (prev + 1) % 3);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isDark]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      <div className="w-full px-10 h-24 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo: font-size 24px, letter-spacing 0, mix-blend-mode applied */}
          <span className="font-black text-[24px] tracking-[0] uppercase mix-blend-difference text-theme-text-primary">DUXX</span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-theme-card/30 hover:bg-theme-accent/10 transition-colors duration-500 group relative flex items-center justify-center w-12 h-12"
          aria-label="Toggle Theme"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isDark ? 'dark' : `light-${moonPhase}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 flex items-center justify-center text-[#FACC15]" // 선명한 옐로우 톤 통일
            >
              {isDark ? (
                <motion.div
                  animate={{ 
                    rotate: 360
                  }}
                  transition={{ 
                    duration: 12, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                >
                  <Sun className="w-6 h-6" fill="currentColor" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ 
                    y: [0, -2, 0],
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
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
