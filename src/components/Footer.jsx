import React from 'react';
import pkg from '../../package.json';

/**
 * [Standard Component] 푸터
 * @description 단순화된 새로운 표준 푸터입니다. 좌측 정렬 및 버전 정보만 노출합니다.
 */
const Footer = () => {
  return (
    <footer id="footer-section" data-section="footer-section" className="py-12 border-t border-theme-border bg-theme-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-start gap-1">
          <p className="text-theme-text-primary font-black text-sm tracking-tighter">
            ©DUXX
          </p>
          <p className="text-theme-text-secondary text-[11px] font-bold opacity-60">
            Build v{pkg.version.split('.').slice(0, 2).join('.')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
