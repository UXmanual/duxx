import React from 'react';
import pkg from '../../package.json';

/**
 * [Component] 푸터
 * @version 11.5.0
 * @author Antigravity
 * @description 
 * - 푸터 로고에도 'color-burn' 블렌딩 모드를 적용하여 배경 지도와 강렬하게 반응하도록 했습니다.
 */
const Footer = () => {
  return (
    <footer style={{ display: 'contents' }}>
      <div className="absolute bottom-0 left-0 w-full px-10 py-8 z-10 pointer-events-none">
        <div className="flex flex-col items-start gap-1 py-5 inline-block pointer-events-auto">
          <div className="flex items-center gap-3 opacity-60 text-theme-text-secondary">
            <p className="text-[14px] font-bold tracking-[0]">
              Build v{pkg.version.split('.').slice(0, 2).join('.')}
            </p>
            <span className="w-px h-3 bg-current opacity-30" />
            <p className="text-[14px] font-bold tracking-[0]">
              Last Deployed: 17:05 KST
            </p>
          </div>
          {/* 
            [Copyright Layer] 
            'color-burn' 모드를 사용하여 배경색을 어둡게 강조하는 블렌딩을 구현했습니다.
          */}
          <div style={{ mixBlendMode: 'color-burn' }}>
            <p className="font-black text-[14px] tracking-[0] select-none">
              ©DUXX
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
