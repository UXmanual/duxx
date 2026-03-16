import React from 'react';
import pkg from '../../package.json';

/**
 * [Component] 푸터
 * @version 20.2
 * @author Antigravity
 * @description 
 * - 푸터의 배포 시간 정보를 제거하고 빌드 버전만 노출하도록 간소화했습니다.
 * - 푸터의 모든 텍스트 드래그(선택)를 방지하는 select-none 속성을 유지합니다.
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
