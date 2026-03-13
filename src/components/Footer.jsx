import React from 'react';
import pkg from '../../package.json';

/**
 * [Standard Component] 푸터
 * @version 10.3.0
 * @description 
 * - 푸터 로고에도 헤더와 동일한 고성능 블렌딩 기법을 적용했습니다.
 */
const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="w-full px-10 py-8">
        <div className="flex flex-col items-start gap-1 py-5 inline-block pointer-events-auto">
          <div className="flex items-center gap-3 opacity-40">
            <p className="text-theme-text-secondary text-[14px] font-bold tracking-[0]">
              Build v{pkg.version.split('.').slice(0, 2).join('.')}
            </p>
            <span className="w-px h-3 bg-theme-text-secondary opacity-30" />
            <p className="text-theme-text-secondary text-[14px] font-bold tracking-[0]">
              Last Deployed: 16:15 KST
            </p>
          </div>
          {/* Copyright: Photoshop-like 블렌딩 마감 */}
          <p 
            className="font-black text-[14px] tracking-[0] select-none"
            style={{ 
              mixBlendMode: 'difference',
              color: 'white',
              display: 'inline-block',
              willChange: 'mix-blend-mode'
            }}
          >
            ©DUXX
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
