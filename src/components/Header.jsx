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
          className="p-3 rounded-2xl bg-theme-card/30 hover:bg-theme-accent hover:text-white transition-all duration-500 group relative overflow-hidden"
          aria-label="Toggle Theme"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isDark ? 'dark' : 'light'}
              initial={{ y: 10, opacity: 0, rotate: -45 }}
              animate={{ 
                y: 0, 
                opacity: 0.7, 
                rotate: 0,
                transition: { type: 'spring', stiffness: 300, damping: 20 }
              }}
              exit={{ y: -10, opacity: 0, rotate: 45 }}
              whileHover={{ scale: 1.1, opacity: 1 }}
              className="relative z-10"
            >
              {isDark ? (
                <motion.div
                  animate={{ 
                    rotate: 360
                  }}
                  transition={{ 
                    duration: 10, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                >
                  <Sun className="w-6 h-6" fill="currentColor" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ 
                    y: [0, -3, 0],
                    rotate: [0, 10, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <Moon className="w-6 h-6" fill="currentColor" />
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Subtle Glow Effect on Hover */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>
      </div>
    </header>
  );
};

export default Header;
