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
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 font-sans antialiased overflow-x-hidden">
      {/* Dynamic Mesh Background (Global) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen" 
        />
        <div className="absolute top-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[130px] rounded-full mix-blend-screen" />
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] bg-purple-600/10 blur-[140px] rounded-full mix-blend-screen" />
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
