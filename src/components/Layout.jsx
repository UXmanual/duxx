import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * [Layout] 전문 시맨틱 레이아웃 (Interactive & Blending v3)
 * 
 * @description
 * 1. Semantic Structure: Header -> Main -> Footer 순서 준수
 * 2. Blending Engine: UI 컨테이너의 display: contents를 통해 스태킹 컨텍스트를 제거, 
 *    하위 로고가 지도의 픽셀 데이터와 직접 블렌딩(Overlay)되도록 구현
 * 3. Interaction: 지도는 z-0(relative)로 배치하여 드래그 및 클릭 방해 요소를 완벽 제거
 * 
 * @version 11.3.0
 */
const Layout = () => {
  return (
    <div 
      id="duxx-app-root" 
      className="relative w-full h-[100dvh] overflow-hidden font-sans antialiased bg-theme-bg"
    >
      {/* [Semantic 1] Header (UI Layer) */}
      <Header />

      {/* [Semantic 2] Main Content (Map Layer) */}
      <main 
        id="main-content" 
        role="main" 
        className="relative w-full h-full"
        aria-label="Interactive Map"
      >
        <Outlet />
      </main>

      {/* [Semantic 3] Footer (UI Layer) */}
      <Footer />
    </div>
  );
};

export default Layout;
