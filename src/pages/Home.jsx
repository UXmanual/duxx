import React from 'react';
import { FolderTree, FileCode, Settings, Layout, Layers, Package, Globe } from 'lucide-react';

const DirectoryItem = ({ name, description, details }) => (
  <div className="group p-6 border-b border-theme-border last:border-0 hover:bg-theme-card-bg transition-all duration-300">
    <div className="flex items-start gap-4 mb-3">
      <div className="mt-1 p-2 rounded-lg bg-theme-accent/5 text-theme-accent group-hover:bg-theme-accent group-hover:text-theme-bg transition-colors">
        <FolderTree className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-theme-text-primary text-base tracking-tight">{name}</h4>
        <p className="text-theme-text-secondary text-sm font-medium mt-1">{description}</p>
      </div>
    </div>
    {details && (
      <div className="ml-13 grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
        {details.map((detail, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[11px] text-theme-text-secondary font-semibold bg-theme-bg border border-theme-border px-3 py-1.5 rounded-lg shadow-sm">
            <div className="w-1 h-1 rounded-full bg-theme-accent" />
            {detail}
          </div>
        ))}
      </div>
    )}
  </div>
);

const Home = () => {
  return (
    <div className="pt-40 pb-48 max-w-5xl mx-auto px-6">
      <div className="mb-24 text-center">
        <div className="inline-block px-5 py-2 mb-8 rounded-full bg-theme-badge-bg border border-theme-border text-theme-badge-text text-[11px] font-black tracking-[0.2em] uppercase shadow-sm">
          System Core v1.1.3
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-theme-text-primary tracking-tighter mb-6 leading-tight">
          Project <span className="text-theme-accent">Blueprint</span>
        </h1>
        <p className="text-theme-text-secondary text-lg font-medium max-w-2xl mx-auto leading-relaxed">
          DUXX 프로젝트는 유지보수성과 확장성을 최우선으로 설계되었습니다. <br />
          아래는 프로젝트를 구성하는 핵심 디렉토리와 관리 규칙입니다.
        </p>
      </div>

      <div className="space-y-16">
        {/* 1. Directory Architecture */}
        <section>
          <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-theme-text-primary">
            <Layers className="w-6 h-6 text-theme-accent" />
            <h2 className="font-black uppercase tracking-widest text-lg text-theme-text-primary">Directory Architecture</h2>
          </div>
          <div className="bg-theme-bg border border-theme-border rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <DirectoryItem 
              name="src/components/" 
              description="재사용 가능한 아토믹 디자인 기반의 컴포넌트들을 관리합니다." 
              details={["Header: 내비게이션 및 테마 제어", "Footer: 서비스 정보 및 버전 관리", "Main: 전역 레이아웃 프레임워크", "Common UI: 버튼, 배지 등 공통 요소"]}
            />
            <DirectoryItem 
              name="src/pages/" 
              description="라우팅 주소와 매칭되는 독립적인 페이지 단위의 뷰를 정의합니다." 
              details={["Home: 아키텍처 가이드 대시보드", "About: 서비스 소개 및 비전 페이지", "Showcase: 프로젝트 결과물 갤러리"]}
            />
            <DirectoryItem 
              name="src/styles/" 
              description="전문화된 CSS 아키텍처를 통해 스타일을 중앙 집중식으로 관리합니다." 
              details={["global.css: 전역 레이아웃 및 리셋", "themes/light.css: 라이트 모드 컬러 토큰", "themes/dark.css: 다크 모드 컬러 토큰"]}
            />
            <DirectoryItem 
              name="src/data/" 
              description="비즈니스 로직과 분리된 순수 정적 데이터를 관리합니다." 
              details={["navigation.json: 메뉴 구조 및 경로 정의", "config.json: 프로젝트 환경 설정 데이터"]}
            />
          </div>
        </section>

        {/* 2. Style Governance */}
        <section>
          <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-theme-text-primary">
            <Settings className="w-6 h-6 text-theme-accent" />
            <h2 className="font-black uppercase tracking-widest text-lg text-theme-text-primary">Style Governance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-[32px] bg-theme-card border border-theme-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-theme-accent/5 text-theme-accent"><Package className="w-6 h-6" /></div>
                <h3 className="font-bold text-lg text-theme-text-primary">Hardcoding Zero</h3>
              </div>
              <p className="text-sm text-theme-text-secondary leading-relaxed mb-6 font-medium">
                모든 시각 요소는 Tailwind Config에 매핑된 <strong>Semantic Classes</strong>를 통해서만 제어됩니다. 파일 내에서 특정 색상 코드나 Tailwind 고유 컬러를 직접 사용하는 것을 금지합니다.
              </p>
              <code className="block p-4 rounded-xl bg-theme-bg border border-theme-border text-[10px] text-theme-accent font-bold">
                CLASS: text-theme-text-primary <br />
                NOT: text-slate-900
              </code>
            </div>
            <div className="p-8 rounded-[32px] bg-theme-card border border-theme-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-theme-accent/5 text-theme-accent"><Globe className="w-6 h-6" /></div>
                <h3 className="font-bold text-lg text-theme-text-primary">Contextual Theming</h3>
              </div>
              <p className="text-sm text-theme-text-secondary leading-relaxed mb-6 font-medium">
                사용자의 환경이나 버튼 토글에 따라 <code>.dark</code> 클래스를 HTML 루트에 주입하여 즉각적인 테마 전환을 지원합니다. 모든 변수는 전역 상속을 통해 효율적으로 업데이트됩니다.
              </p>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-white border border-theme-border shadow-inner" />
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-theme-border shadow-inner" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
