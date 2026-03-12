import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * 단순화된 메인 레이아웃
 * @description 모든 배경 모션 및 메시 효과 삭제
 */
const Main = () => {
  return (
    <div className="min-h-screen bg-theme-bg text-theme-text font-sans antialiased grainy-bg">
      <Header />
      <main className="relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Main;
