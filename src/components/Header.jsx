import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

/**
 * [Component] 상단 헤더
 * @description 블러 처리와 배경색을 제거한 투명한 레이아웃의 헤더 컴포넌트입니다.
 */
const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo: font-size 24px, letter-spacing 0 */}
          <span className="font-black text-[24px] tracking-[0] uppercase">DUXX</span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-theme-card/50 hover:bg-theme-accent hover:text-white transition-all duration-300 group"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          ) : (
            <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-500" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
