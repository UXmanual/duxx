import React from 'react';
import pkg from '../../package.json';

/**
 * [Standard Component] 푸터
 * @description 블렌딩 모드가 적용된 로고를 포함하며, 정보 순서가 조정된 푸터 컴포넌트입니다.
 */
const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="w-full px-10 py-8 text-white">
        <div className="flex flex-col items-start gap-1 py-5 inline-block pointer-events-auto">
          <div className="flex items-center gap-3 opacity-40">
            {/* Version Info: font-size 14px, letter-spacing 0 */}
            <p className="text-theme-text-secondary text-[14px] font-bold tracking-[0]">
              Build v{pkg.version.split('.').slice(0, 2).join('.')}
            </p>
            <span className="w-px h-3 bg-theme-text-secondary opacity-30" />
            <p className="text-theme-text-secondary text-[14px] font-bold tracking-[0]">
              Last Deployed: 16:10 KST
            </p>
          </div>
          {/* Copyright: font-size 14px, letter-spacing 0, mix-blend-mode applied */}
          <p className="font-black text-[14px] tracking-[0] mix-blend-difference text-white select-none">
            ©DUXX
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
