import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * [Standard] 플로팅 레이아웃 (시맨틱 구조 최적화)
 * @version 10.5.0
 * @description 
 * - 사용자 피드백을 반영하여 Header -> main -> Footer 순으로 구조를 재배치했습니다.
 * - 지도를 absolute로 바닥에 깔고, 인터페이스를 그 위에서 블렌딩(mix-blend-mode)되도록 구성했습니다.
 */
const Layout = () => {
  return (
    <div id="duxx-layout-root" className="relative w-full h-screen overflow-hidden">
      {/* 1. 메인 콘텐츠 (Backdrop) */}
      <main id="main-content" className="absolute inset-0">
        <Outlet />
      </main>

      {/* 2. 인터페이스 레이어 (Foreground / Blending) */}
      <Header />
      <Footer />
    </div>
  );
};

export default Layout;
