import React from 'react';
import pkg from '../../package.json';

/**
 * [Component] 푸터
 * @version 11.7.0
 * @author Antigravity
 * @description 
 * - 푸터의 모든 텍스트를 블랙 컬러에 투명도 0.3으로 통일했습니다.
 * - 블렌딩 모드를 제거하고 깔끔한 플랫 디자인으로 변경했습니다.
 */
const Footer = () => {
  return (
    <footer style={{ display: 'contents' }}>
      <div className="absolute bottom-0 left-0 w-full px-10 py-8 z-10 pointer-events-none">
        <div className="flex flex-col items-start gap-1 py-5 inline-block pointer-events-auto text-black opacity-30">
          {/* 시스템 정보: 블랙 0.3 */}
          <div className="flex items-center gap-3">
            <p className="text-[14px] font-bold tracking-[0]">
              Build v{pkg.version.split('.').slice(0, 2).join('.')}
            </p>
            <span className="w-px h-3 bg-black opacity-100" />
            <p className="text-[14px] font-bold tracking-[0]">
              Last Deployed: 2026.03.16 10:30
            </p>
          </div>
          {/* 저작권: 블랙 0.3 */}
          <p className="font-black text-[14px] tracking-[0] select-none">
            ©Babble
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
