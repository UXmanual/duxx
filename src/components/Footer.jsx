import React from 'react';
import pkg from '../../package.json';

/**
 * [Standard Component] 푸터 (레이어 통합 버전)
 * @version 10.6.0
 * @description 
 * - 'fixed'를 제거하고 'absolute' 배치를 적용하여 지도와 블렌딩이 가능하도록 수정했습니다.
 */
const Footer = () => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="w-full px-10 py-8">
        <div className="flex flex-col items-start gap-1 py-5 inline-block pointer-events-auto">
          <div className="flex items-center gap-3 opacity-40 text-theme-text-secondary">
            <p className="text-[14px] font-bold tracking-[0]">
              Build v{pkg.version.split('.').slice(0, 2).join('.')}
            </p>
            <span className="w-px h-3 bg-current opacity-30" />
            <p className="text-[14px] font-bold tracking-[0]">
              Last Deployed: 16:29 KST
            </p>
          </div>
          {/* Logo: 배경 반전 효과 */}
          <p 
            className="font-black text-[14px] tracking-[0] select-none"
            style={{ 
              mixBlendMode: 'difference',
              color: '#ffffff',
              display: 'inline-block'
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
