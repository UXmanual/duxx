import React from 'react';
import pkg from '../../package.json';

/**
 * [Component] 푸터
 * @version 11.2.0
 */
const Footer = () => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 pointer-events-none">
      <div className="w-full px-10 py-8">
        <div className="flex flex-col items-start gap-1 py-5 inline-block pointer-events-auto">
          {/* 버전 정보는 선명하게 유지 */}
          <div className="flex items-center gap-3 opacity-60 text-theme-text-secondary">
            <p className="text-[14px] font-bold tracking-[0]">
              Build v{pkg.version.split('.').slice(0, 2).join('.')}
            </p>
            <span className="w-px h-3 bg-current opacity-30" />
            <p className="text-[14px] font-bold tracking-[0]">
              Last Deployed: 16:56 KST
            </p>
          </div>
          {/* Copyright: 배경 오버레이 블렌딩 적용 */}
          <p 
            className="font-black text-[14px] tracking-[0] select-none"
            style={{ 
              mixBlendMode: 'overlay',
              color: '#F8F8F8'
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
