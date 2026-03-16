import React from 'react';
import pkg from '../../package.json';

/**
 * [Component] 푸터
 * @version 17.2
 * @author Antigravity
 * @description 
 * - 푸터의 모든 텍스트 드래그(선택)를 방지하는 select-none 속성을 추가했습니다.
 * - 텍스트 컬러 투명도 0.3을 유지하며 깔끔하게 마감했습니다.
 */
const Footer = () => {
  return (
    <footer style={{ display: 'contents' }}>
      <div className="absolute bottom-0 left-0 px-10 py-8 z-10 pointer-events-none">
        <div className="flex flex-col items-start gap-1 py-5 inline-block pointer-events-auto text-black opacity-30 select-none">
          {/* 시스템 정보: 블랙 0.3 */}
          <div className="flex items-center gap-3">
            <p className="text-[14px] font-bold tracking-[0]">
              Build v{pkg.version.split('.').slice(0, 2).join('.')}
            </p>
            <span className="w-px h-3 bg-black opacity-100" />
            <p className="text-[14px] font-bold tracking-[0]">
              Last Deployed: 2026.03.16 14:15
            </p>
          </div>
          {/* 저작권: 블랙 0.3 */}
          <p className="font-black text-[14px] tracking-[0] select-none">
            ©Babble
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
