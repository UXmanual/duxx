import React from 'react';
import pkg from '../../package.json';

/**
 * [Standard Component] 푸터 (전체 블렌딩 적용 버전)
 * @version 10.7.0
 * @author Antigravity
 * @description 
 * - 블렌딩 모드를 푸터 컨테이너 자체에 적용하여 로고와 텍스트가 배경에 따라 반전되도록 했습니다.
 */
const Footer = () => {
  return (
    <footer 
      className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none"
      style={{ mixBlendMode: 'difference' }}
    >
      <div className="w-full px-10 py-8">
        <div className="flex flex-col items-start gap-1 py-5 inline-block pointer-events-auto">
          <div className="flex items-center gap-3 opacity-80 text-white">
            <p className="text-[14px] font-bold tracking-[0]">
              Build v{pkg.version.split('.').slice(0, 2).join('.')}
            </p>
            <span className="w-px h-3 bg-current opacity-30" />
            <p className="text-[14px] font-bold tracking-[0]">
              Last Deployed: 16:32 KST
            </p>
          </div>
          {/* Copyright: 컨테이너 블렌딩을 통해 배경과 반전됨 */}
          <p className="font-black text-[14px] tracking-[0] select-none text-white">
            ©DUXX
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
