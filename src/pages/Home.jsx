import React from 'react';
import { Layers, Settings, Package, Globe } from 'lucide-react';
import DirectoryItem from '../components/home/DirectoryItem';

/**
 * 프로젝트 아키텍처 가이드 (Home)
 * @description 이제 개별 아이템 디자인은 DirectoryItem.jsx에서 관리합니다.
 */
const Home = () => {
  return (
    <div className="pt-40 pb-48 max-w-6xl mx-auto px-6">
      <div className="mb-24 text-center">
        <div className="inline-block px-5 py-2 mb-8 rounded-full bg-theme-badge-bg border border-theme-border text-theme-badge-text text-[11px] font-black tracking-[0.2em] uppercase shadow-sm">
          Decoupled Architecture v1.1.6
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-theme-text-primary tracking-tighter mb-6 leading-tight">
          System <span className="text-theme-accent">Isolation</span>
        </h1>
        <p className="text-theme-text-secondary text-lg font-medium max-w-3xl mx-auto leading-relaxed">
          에이전트 수정 간 충돌을 방지하기 위해 스타일, 로직, 레이아웃을 완전히 격리했습니다. <br />
          각 요소는 이제 독립된 환경에서 안전하게 관리됩니다.
        </p>
      </div>

      <div className="space-y-16">
        {/* 1. Directory Architecture */}
        <section>
          <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-theme-text-primary">
            <Layers className="w-6 h-6 text-theme-accent" />
            <h2 className="font-black uppercase tracking-widest text-lg text-theme-text-primary">Independent Assets</h2>
          </div>
          <div className="bg-theme-border rounded-[32px] overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-2 gap-[1px]">
            <DirectoryItem 
              name="src/context/" 
              description="[Logic Isolation] 테마 및 전역 상태 로직을 전담 관리합니다." 
              details={["ThemeContext: 다크모드 영속성 및 토글 로직"]}
            />
            <DirectoryItem 
              name="src/styles/themes/" 
              description="[Style Isolation] 순수 색상 변수 데이터만 포함합니다." 
              details={["light.css: 라이트 모드 컬러 셋", "dark.css: 다크 모드 컬러 셋"]}
            />
            <DirectoryItem 
              name="src/components/home/" 
              description="[Component Isolation] 특정 페이지 전용 UI를 별도로 관리합니다." 
              details={["DirectoryItem: 아키텍처 리스트 UI"]}
            />
            <DirectoryItem 
              name="src/main.jsx" 
              description="[Sequence Control] 스타일 로딩 및 앱 래핑 순서를 결정합니다." 
              details={["ThemeProvider: 앱 전체 로직 감싸기"]}
            />
          </div>
        </section>

        {/* 2. Style Governance */}
        <section>
          <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-theme-text-primary">
            <Settings className="w-6 h-6 text-theme-accent" />
            <h2 className="font-black uppercase tracking-widest text-lg text-theme-text-primary">Agent Safety</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-[32px] bg-theme-card border border-theme-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-theme-accent/5 text-theme-accent"><Package className="w-6 h-6" /></div>
                <h3 className="font-bold text-lg text-theme-text-primary">No Interference</h3>
              </div>
              <p className="text-sm text-theme-text-secondary leading-relaxed mb-6 font-medium">
                에이전트가 헤더 디자인을 고치다가 테마 로직을 깨뜨릴 수 없습니다. 로직은 <code>context/</code> 폴더에 격리되어 있기 때문입니다.
              </p>
            </div>
            <div className="p-8 rounded-[32px] bg-theme-card border border-theme-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-theme-accent/5 text-theme-accent"><Globe className="w-6 h-6" /></div>
                <h3 className="font-bold text-lg text-theme-text-primary">Persistent Theme</h3>
              </div>
              <p className="text-sm text-theme-text-secondary leading-relaxed mb-6 font-medium">
                테마 정보가 LocalStorage에 저장되어 페이지 새로고침 시에도 유지됩니다. 이 핵심 로직은 UI와 분리되어 독립적으로 작동합니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
