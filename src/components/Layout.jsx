import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * [Layout] 전문 시맨틱 레이아웃 (Simplified v42.9)
 * @description UI 요소를 Main.jsx로 일원화하여 레이어 꼬임 현상을 원천 차단
 */
const Layout = () => {
  return (
    <div 
      id="duxx-app-root" 
      className="fixed top-0 left-0 right-0 -bottom-[100px] w-full min-h-[-webkit-fill-available] overflow-visible font-sans antialiased bg-transparent"
    >
      <main 
        id="main-content" 
        role="main" 
        className="w-full h-full min-h-[120vh] overflow-visible"
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
