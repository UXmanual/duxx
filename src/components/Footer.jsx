import React from 'react';
import pkg from '../../package.json';

/**
 * [Standard Component] 푸터 (Overlay 블렌딩 버전)
 * @version 10.8.0
 * @author Antigravity
 * @description 
 * - 푸터 전체에 'overlay' 블렌딩을 적용하여 텍스트가 배경 지도와 부드럽게 섞이도록 했습니다.
 */
const Footer = () => {
  return (
    <footer 
      className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none"
      style={{ mixBlendMode: 'overlay' }}
    >
      <div className="w-full px-10 py-8">
        <div className="flex flex-col items-start gap-1 py-5 inline-block pointer-events-auto">
          <div className="flex items-center gap-3 opacity-60">
            <p className="text-[14px] font-bold tracking-[0]">
              Build v{pkg.version.split('.').slice(0, 2).join('.')}
            </p>
            <span className="w-px h-3 bg-current opacity-30" />
            <p className="text-[14px] font-bold tracking-[0]">
              Last Deployed: 16:36 KST
            </p>
          </div>
          {/* Copyright: 명시적 컬러 제거 및 Overlay 블렌딩 */}
          <p className="font-black text-[14px] tracking-[0] select-none">
            ©DUXX
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
