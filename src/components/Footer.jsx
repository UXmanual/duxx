import React from 'react';
import pkg from '../../package.json';

/**
 * [Component] 푸터 (무격리 블렌딩 버전)
 * @version 11.2.0
 */
const Footer = () => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 pointer-events-none">
      <div className="w-full px-10 py-8">
        <div className="flex flex-col items-start gap-1 py-5 inline-block pointer-events-auto">
          <div className="flex items-center gap-3 opacity-60 text-theme-text-secondary">
            <p className="text-[14px] font-bold tracking-[0]">
              Build v{pkg.version.split('.').slice(0, 2).join('.')}
            </p>
            <span className="w-px h-3 bg-current opacity-30" />
            <p className="text-[14px] font-bold tracking-[0]">
              Last Deployed: 16:51 KST
            </p>
          </div>
          {/* Copyright: 배경에 따라 색상이 동적으로 변하는 Overlay 모드 */}
          <p 
            className="font-black text-[14px] tracking-[0] select-none"
            style={{ 
              mixBlendMode: 'overlay',
              color: 'inherit'
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
