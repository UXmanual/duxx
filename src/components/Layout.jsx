import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * [Standard] 시맨틱 레이아웃
 * @version 11.0.0
 * @author Antigravity
 * @description 
 * - 사용자 요청에 따라 소스코드 구조를 Header -> Main -> Footer 순으로 정비했습니다.
 * - 시맨틱한 순서를 유지하면서도 지도가 배경으로 작동하도록 레이어 순서를 관리합니다.
 */
const Layout = () => {
  return (
    <div id="duxx-layout-root" className="relative w-full h-screen overflow-hidden">
      {/* 1. 상단 인터페이스 */}
      <Header />

      {/* 2. 메인 콘텐츠 (Backdrop 지도는 뒷단에 배치) */}
      <main id="main-content" className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full pointer-events-auto">
          <Outlet />
        </div>
      </main>

      {/* 3. 하단 인터페이스 */}
      <Footer />
    </div>
  );
};

export default Layout;
