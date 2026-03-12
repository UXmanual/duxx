import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * 전역 레이아웃 (껍데기)
 * @description 헤더, 푸터와 같은 공통 틀을 정의하며 대소문자 규칙을 준수합니다.
 */
const Layout = () => {
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

export default Layout;
