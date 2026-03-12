import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import navData from '../data/navigation.json';

/**
 * 순수 UI 헤더 컴포넌트
 * @description 테마 전환 '로직'은 context에 위임하고, '이벤트'만 전달합니다.
 */
const Header = () => {
  const location = useLocation();
  const { navItems } = navData;
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 w-full z-[100] bg-theme-bg/80 backdrop-blur-md border-b border-theme-border py-4">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex-1 flex justify-center gap-10">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path}
              className={`text-sm font-bold tracking-tight transition-colors ${
                location.pathname === item.path 
                  ? 'text-theme-accent' 
                  : 'text-theme-text-secondary hover:text-theme-text-primary'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-theme-bg border border-theme-border text-theme-text-primary hover:shadow-md transition-all active:scale-95"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>
      </div>
    </nav>
  );
};

export default Header;
