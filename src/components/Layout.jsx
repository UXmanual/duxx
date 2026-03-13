import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * [Standard] 플로팅 레이아웃
 * @description 헤더와 푸터를 고정(Fixed)하여 메인 콘텐츠(지도) 위에 띄우는 구조입니다.
 */
const Layout = () => {
  return (
    <div id="duxx-layout-root" className="min-h-screen text-theme-text-primary font-sans antialiased overflow-hidden" style={{ isolation: 'isolate' }}>
      {/* 바닥 레이어: 메인 콘텐츠 (지도) */}
      <main id="main-content" data-section="main-content" className="absolute inset-0">
        <Outlet />
      </main>

      {/* 상단 레이어: 인터페이스 (헤더/푸터) */}
      <Header />
      <Footer />
    </div>
  );
};

export default Layout;
