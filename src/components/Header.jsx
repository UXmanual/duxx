import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import navData from '../../data/navigation.json';

/**
 * 단순화된 헤더 컴포넌트
 * @description 로고 및 모션 효과 삭제, 내비게이션 기능만 유지
 */
const Header = () => {
  const location = useLocation();
  const { navItems } = navData;

  return (
    <nav className="fixed top-0 w-full z-[100] bg-theme-bg border-b border-theme-border py-4">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-10">
        {navItems.map((item) => (
          <Link 
            key={item.name} 
            to={item.path}
            className={`text-sm font-bold tracking-tight transition-colors ${
              location.pathname === item.path ? 'text-theme-accent' : 'text-theme-text-muted hover:text-theme-text'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Header;
