import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, MoonStar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * [Component] 상단 헤더
 * @version 11.2.0
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
    <header className="absolute top-0 left-0 right-0 pointer-events-none">
      <div className="w-full px-10 h-24 flex items-center justify-between">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Logo: 부모의 z-index가 없으므로 지도의 픽셀과 직접 Overlay 블렌딩됨 */}
          <span 
            className="font-black text-[24px] tracking-[0] uppercase select-none"
            style={{ 
              mixBlendMode: 'overlay',
              color: '#F8F8F8' // 오버레이 효과 극대화를 위한 오프화이트 베이스
            }}
          >
            DUXX
          </span>
        </div>
        
        {/* 테마 버튼: 블렌딩 효과의 영향을 받지 않도록 isolation 적용 */}
        <div className="pointer-events-auto" style={{ isolation: 'isolate' }}>
          <button 
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-theme-card/40 hover:bg-theme-accent/20 transition-all duration-300 group relative flex items-center justify-center w-12 h-12"
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
      </div>
    </header>
  );
};

export default Header;
