import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * [Standard] 전역 레이아웃
 * @description 무간섭 원칙: 레이아웃은 틀만 제공하며, 자식 컴포넌트의 스타일 영역을 침범하지 않음.
 */
const Layout = () => {
  return (
    <div id="duxx-layout-root" className="min-h-screen bg-theme-bg text-theme-text-primary font-sans antialiased">
      <Header />
      {/* 
         data-section="main-content"
         에이전트 수정 시 이 하위 영역만 영향권을 가짐 
      */}
      <main id="main-content" data-section="main-content" className="relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
