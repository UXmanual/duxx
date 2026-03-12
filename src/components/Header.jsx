import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Menu, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import navData from '../data/navigation.json';

/**
 * 전역 헤더 컴포넌트
 * @description 사이트의 내비게이션을 담당하며 스크롤 상태에 따라 디자인이 변함
 */
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { navItems } = navData;

  return (
    <nav className={`
      fixed top-0 w-full z-[100] transition-all duration-500 border-b
      ${isScrolled 
        ? 'py-4 bg-theme-bg/80 backdrop-blur-xl border-theme-border shadow-xl' 
        : 'py-6 bg-transparent border-transparent'}
    `}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-theme-text tracking-tighter">DUXX</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path}
              className={`text-sm font-semibold transition-all transform hover:-translate-y-0.5 ${
                location.pathname === item.path ? 'text-theme-accent' : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        <button className="md:hidden text-theme-text">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};

export default Header;
