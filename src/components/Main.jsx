import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * 단순화된 메인 레이아웃
 * @description selection 배경색까지 테마 변수를 사용하도록 수정했습니다.
 */
const Main = () => {
  return (
    <div className="min-h-screen bg-theme-bg text-theme-text-primary font-sans antialiased">
      <Header />
      <main className="relative z-10 selection:bg-theme-accent/20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Main;
