import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * [Layout] 무격리 시맨틱 레이아웃 (Blending Engine v2)
 * 
 * @description
 * mix-blend-mode가 작동하지 않는 근본 원인인 'Stacking Context Isolation'을 해결하기 위해
 * z-index를 배제하고 DOM 순서(Paint Order)에만 의존하는 구조로 재설계했습니다.
 * 
 * @logic
 * 1. Main(지형): DOM의 처음에 위치하여 바닥 레이어 형성
 * 2. Header/Footer(인터페이스): Main 다음에 위치하여 자연스럽게 위에 겹침
 * 3. 이 구조에서 Header는 격리되지 않으므로, 하위 요소인 로고가 지도의 픽셀과 직접 블렌딩 가능
 */
const Layout = () => {
  return (
    <div 
      id="duxx-app-root" 
      className="relative w-full h-screen overflow-hidden font-sans antialiased"
      style={{ isolation: 'auto' }} // 격리 방지
    >
      {/* 
        1. 메인 콘텐츠 (Backdrop)
        DOM 순서가 앞서므로 가장 아래에 그려집니다.
      */}
      <main id="main-content" role="main" className="absolute inset-0">
        <Outlet />
      </main>

      {/* 
        2. 인터페이스 (Header)
        z-index 없이 DOM 순서에 의해 Main 위로 겹쳐집니다. (블렌딩 허용)
      */}
      <Header />

      {/* 
        3. 인터페이스 (Footer)
        z-index 없이 DOM 순서에 의해 Main 위로 겹쳐집니다. (블렌딩 허용)
      */}
      <Footer />
    </div>
  );
};

export default Layout;
