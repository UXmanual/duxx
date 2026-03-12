import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * 프로젝트 전역 메인 구조
 * @description 헤더, 푸터, 공통 배경 효과를 포함하며 중앙의 Outlet에 페이지가 렌더링됨
 */
const Main = () => {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text selection:bg-indigo-100 font-sans antialiased overflow-x-hidden grainy-bg">
      {/* Dynamic Background Layering */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-blue-400/10 blur-[120px] rounded-full" 
        />
        <div className="absolute top-[20%] -right-[15%] w-[50%] h-[50%] bg-indigo-400/10 blur-[130px] rounded-full" />
      </div>

      <Header />
      
      {/* 각 페이지가 렌더링되는 영역 */}
      <main className="relative z-10 min-h-[calc(100vh-80px)]">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Main;
