import React from 'react';
import pkg from '../../package.json';

/**
 * [Standard Component] 푸터
 * @version 10.9.0
 * @author Antigravity
 * @description 
 * - 하단 Copyright 로고에만 'overlay' 블렌딩을 적용했습니다.
 */
const Footer = () => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="w-full px-10 py-8">
        <div className="flex flex-col items-start gap-1 py-5 inline-block pointer-events-auto">
          <div className="flex items-center gap-3 opacity-60 text-theme-text-secondary">
            <p className="text-[14px] font-bold tracking-[0]">
              Build v{pkg.version.split('.').slice(0, 2).join('.')}
            </p>
            <span className="w-px h-3 bg-current opacity-30" />
            <p className="text-[14px] font-bold tracking-[0]">
              Last Deployed: 16:42 KST
            </p>
          </div>
          {/* Copyright: 개별 블렌딩 적용 */}
          <p 
            className="font-black text-[14px] tracking-[0] select-none"
            style={{ mixBlendMode: 'overlay' }}
          >
            ©DUXX
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
