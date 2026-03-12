import React from 'react';
import pkg from '../../package.json';

/**
 * [Standard Component] 푸터
 * @description 단순화된 새로운 표준 푸터입니다. 좌측 정렬 및 버전 정보만 노출합니다.
 */
const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col items-start gap-0.5 backdrop-blur-sm bg-theme-bg/10 p-4 rounded-3xl inline-block pointer-events-auto">
          <p className="text-theme-text-primary font-black text-xs tracking-tighter opacity-80">
            ©DUXX
          </p>
          <div className="flex items-center gap-2 opacity-40">
            <p className="text-theme-text-secondary text-[9px] font-bold">
              Build v{pkg.version.split('.').slice(0, 2).join('.')}
            </p>
            <span className="w-0.5 h-2 bg-theme-text-secondary opacity-30" />
            <p className="text-theme-text-secondary text-[9px] font-bold">
              Last Deployed: 15:48 KST
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
