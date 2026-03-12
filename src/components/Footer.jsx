import React from 'react';
import pkg from '../../package.json';

/**
 * [Standard Component] 푸터
 * @description 블러 처리와 배경색을 제거하고 폰트 사이즈(14px) 및 레터 스패싱(0)을 조정한 푸터 컴포넌트입니다.
 */
const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col items-start gap-1 p-5 rounded-[32px] inline-block pointer-events-auto">
          {/* Copyright: font-size 14px, letter-spacing 0 */}
          <p className="text-theme-text-primary font-black text-[14px] tracking-[0] opacity-80">
            ©DUXX
          </p>
          <div className="flex items-center gap-3 opacity-40">
            {/* Version Info: font-size 14px, letter-spacing 0 */}
            <p className="text-theme-text-secondary text-[14px] font-bold tracking-[0]">
              Build v{pkg.version.split('.').slice(0, 2).join('.')}
            </p>
            <span className="w-px h-3 bg-theme-text-secondary opacity-30" />
            <p className="text-theme-text-secondary text-[14px] font-bold tracking-[0]">
              Last Deployed: 16:55 KST
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
