import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * [Component] 상단 헤더
 * @description 블러 처리와 배경색을 제거한 투명한 레이아웃의 헤더 컴포넌트입니다.
 */
const Header = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      <div className="w-full px-10 h-24 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo: font-size 24px, letter-spacing 0 */}
          <span className="font-black text-[24px] tracking-[0] uppercase">DUXX</span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-theme-card/30 hover:bg-theme-accent/10 transition-colors duration-500 group relative flex items-center justify-center w-12 h-12"
          aria-label="Toggle Theme"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isDark ? 'dark' : 'light'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="relative z-10 flex items-center justify-center"
            >
              {isDark ? (
                <motion.div
                  animate={{ 
                    rotate: 360
                  }}
                  transition={{ 
                    duration: 15, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="text-[#FDB813]"
                >
                  <Sun className="w-6 h-6" fill="currentColor" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ 
                    y: [0, -2, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="text-[#D69E2E]"
                >
                  <Moon className="w-6 h-6" fill="currentColor" />
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
