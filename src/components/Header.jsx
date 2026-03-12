import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import navData from '../data/navigation.json';

/**
 * 테마 전환 기능이 포함된 헤더 컴포넌트
 */
const Header = () => {
  const location = useLocation();
  const { navItems } = navData;
  const [isDark, setIsDark] = useState(false);

  // 테마 상태 변경 시 HTML 클래스 조작
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <nav className="fixed top-0 w-full z-[100] bg-theme-bg/80 backdrop-blur-md border-b border-theme-border py-4">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Navigation Links - Centered */}
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

        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-xl bg-theme-card-bg border border-theme-border text-theme-text-primary hover:shadow-md transition-all"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>
      </div>
    </nav>
  );
};

export default Header;
