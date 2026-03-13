import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * [Layout] 전역 시맨틱 레이아웃
 * 
 * @description
 * 본 레이아웃은 전형적인 웹 시맨틱 구조(Header-Main-Footer)를 따르면서, 
 * 전체 화면 지도를 배경으로 활용하는 'Floating UI' 패턴을 구현합니다.
 * 
 * @structure
 * 1. Global Header: 최상단 네비게이션 및 테마 토글 버튼
 * 2. Main Content: 지도를 포함한 핵심 콘텐츠가 렌더링되는 영역 (Backdrop)
 * 3. Global Footer: 저작권 및 시스템 상태 정보 제공
 * 
 * @version 11.1.0
 */
const Layout = () => {
  return (
    <div 
      id="duxx-app-container" 
      className="relative w-full h-screen overflow-hidden font-sans antialiased"
      style={{ isolation: 'isolate' }}
    >
      {/* 
        [Semantic Section] Header
        지도 위에 고정된 인터페이스 레이어입니다.
      */}
      <Header />

      {/* 
        [Semantic Section] Main
        지도가 전체 화면 배경으로 깔리는 영역입니다. 
        pointer-events 설정을 통해 배경 지도는 인터랙션이 가능하면서 
        마린 레이아웃의 시맨틱 순서는 유지합니다.
      */}
      <main 
        id="main-content" 
        role="main" 
        className="absolute inset-0 z-0 pointer-events-none"
        aria-label="Map Content Area"
      >
        <div className="w-full h-full pointer-events-auto">
          <Outlet />
        </div>
      </main>

      {/* 
        [Semantic Section] Footer
        하단에 배치된 시스템 정보 레이어입니다.
      */}
      <Footer />
    </div>
  );
};

export default Layout;
