import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-md bg-theme-bg/30">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-theme-accent rounded-full animate-pulse shadow-lg shadow-theme-accent/20" />
          <span className="font-black text-xl tracking-tighter uppercase">DUXX</span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-theme-card/50 hover:bg-theme-accent hover:text-white transition-all duration-300 border border-theme-border/50 group"
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
