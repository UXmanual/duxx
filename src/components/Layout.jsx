import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * [Layout] 비격리 레이어 아키텍처
 * 
 * @description
 * mix-blend-mode가 지도와 연동되려면 UI 컨테이너가 'Stacking Context'를 형성하지 않아야 합니다.
 * 이를 위해 UI(Header/Footer)는 z-index를 제거하고, 배경(Main)을 음수 z-index로 밀어내는 전략을 사용합니다.
 * 
 * @order
 * 1. Header (Semantic Top - Paint Level: 0)
 * 2. Main (Semantic Mid - Paint Level: -1)
 * 3. Footer (Semantic Bottom - Paint Level: 0)
 */
const Layout = () => {
  return (
    <div 
      id="duxx-app-root" 
      className="relative w-full h-screen overflow-hidden font-sans antialiased text-theme-text-primary"
    >
      {/* [Layer 1] 시맨틱 상단 헤더 (z-index 제거로 블렌딩 허용) */}
      <Header />

      {/* [Layer 2] 메인 콘텐츠 영역 (z-[-1]로 배경화) */}
      <main 
        id="main-content" 
        role="main" 
        className="absolute inset-0 z-[-1]"
        aria-label="Interactive Map Area"
      >
        <Outlet />
      </main>

      {/* [Layer 3] 시맨틱 하단 푸터 (z-index 제거로 블렌딩 허용) */}
      <Footer />
    </div>
  );
};

export default Layout;
