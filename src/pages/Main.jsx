import React from 'react';

/**
 * [Standard Content] 메인 페이지
 * @description 본격적인 개발을 위한 대기 상태입니다.
 * @principle 자기 결정적 레이아웃: 본 섹션의 여백은 본 파일에서 직접 제어합니다.
 */
const Main = () => {
  return (
    <div className="pt-40 pb-48 max-w-7xl mx-auto px-6 font-sans min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-theme-accent/10 border border-theme-accent/20 text-theme-accent text-[10px] font-bold uppercase tracking-widest animate-pulse">
          Standing By
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-theme-text-primary tracking-tighter mb-4">
          작업 예정입니다
        </h1>
        <p className="text-theme-text-secondary font-medium opacity-60">
          이곳에 새로운 프로젝트의 핵심 콘텐츠가 구축될 예정입니다.
        </p>
      </div>
    </div>
  );
};

export default Main;
