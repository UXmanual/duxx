import React from 'react';
import { 
  FolderTree, FileCode, Settings, Layout as LayoutIcon, 
  Layers, Package, Globe, Code2, Database, Palette, 
  AppWindow, ChevronRight, Binary
} from 'lucide-react';

const TreeBranch = ({ name, description, isLast = false, children }) => (
  <div className="relative pl-6">
    {/* Vertical Line */}
    {!isLast && <div className="absolute left-2.5 top-0 bottom-0 w-px bg-theme-border" />}
    
    <div className="relative flex items-start gap-3 py-3">
      {/* Horizontal connector line */}
      <div className="absolute -left-3.5 top-6 w-3.5 h-px bg-theme-border" />
      
      <div className="mt-1 p-1.5 rounded-lg bg-theme-accent/10 text-theme-accent">
        {children ? <FolderTree className="w-4 h-4" /> : <Binary className="w-4 h-4" />}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`font-bold tracking-tight text-sm ${children ? 'text-theme-text-primary' : 'text-theme-accent'}`}>
            {name}{children ? '/' : ''}
          </span>
        </div>
        <p className="text-[11px] text-theme-text-secondary font-medium mt-0.5 leading-relaxed italic">
          {description}
        </p>
        
        {children && (
          <div className="mt-2 ml-1">
            {children}
          </div>
        )}
      </div>
    </div>
  </div>
);

const Main = () => {
  return (
    <div className="pt-40 pb-48 max-w-6xl mx-auto px-6">
      <div className="mb-24 text-center">
        <div className="inline-block px-5 py-2 mb-8 rounded-full bg-theme-badge-bg border border-theme-border text-theme-badge-text text-[11px] font-black tracking-[0.2em] uppercase shadow-sm">
          Architecture Visualization v1.2.4
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-theme-text-primary tracking-tighter mb-6 leading-tight">
          Visual <span className="text-theme-accent">Blueprint</span>
        </h1>
        <p className="text-theme-text-secondary text-lg font-medium max-w-3xl mx-auto leading-relaxed">
          프로젝트 구조를 트리 형태로 시각화했습니다. <br />
          각 폴더와 파일은 독립적인 역할과 책임을 가지며 유기적으로 연결됩니다.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: Tree View Card */}
        <div className="w-full lg:w-7/12 bg-theme-card border border-theme-border rounded-[40px] p-10 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <Layers className="w-64 h-64" />
          </div>
          
          <div className="flex items-center gap-3 mb-10 pb-4 border-b border-theme-border">
            <FolderTree className="w-6 h-6 text-theme-accent" />
            <h2 className="text-xl font-black text-theme-text-primary tracking-tight uppercase">Structure Tree</h2>
          </div>

          <div className="space-y-4">
            <TreeBranch name="src" description="애플리케이션의 모든 소스 코드가 집결된 루트 폴더">
              <TreeBranch name="components" description="UI를 구성하는 독립적인 벽돌(컴포넌트) 저장소">
                <TreeBranch name="home" description="특정 페이지에서만 활용되는 전용 부품 관리">
                  <TreeBranch name="DirectoryItem.jsx" description="구조 가이드의 각 항목을 표현하는 UI" />
                </TreeBranch>
                <TreeBranch name="Layout.jsx" description="[The Shell] 헤더와 푸터를 감싸는 전체 화면의 틀" />
                <TreeBranch name="Header.jsx" description="내비게이션 및 테마 제어 스위치 포함" />
                <TreeBranch name="Footer.jsx" description="사이트 정보 및 빌드 버전 출력" />
              </TreeBranch>

              <TreeBranch name="pages" description="실제 주소(URL)에 따라 교체되는 핵심 콘텐츠 페이지">
                <TreeBranch name="Main.jsx" description="[The Content] 현재 보고 계신 핵심 정보 페이지" />
                <TreeBranch name="About.jsx" description="서비스 비전 및 정체성 소개 페이지" />
              </TreeBranch>

              <TreeBranch name="context" description="애플리케이션 전체에 영향을 주는 '뇌(Logic)' 역할">
                <TreeBranch name="ThemeContext.jsx" description="테마 전환 및 영속성 관리 로직 격리" />
              </TreeBranch>

              <TreeBranch name="styles" description="모든 시각 요소의 정의서">
                <TreeBranch name="themes" description="라이트/다크 모드 컬러 시트">
                  <TreeBranch name="light.css" description="Base Light Color Tokens" />
                  <TreeBranch name="dark.css" description="Override Dark Color Tokens" />
                </TreeBranch>
                <TreeBranch name="global.css" description="테일윈드 및 전역 레이아웃 뼈대" />
              </TreeBranch>

              <TreeBranch name="Routes.jsx" description="[The Map] 경로에 따라 어떤 파일을 보여줄지 결정" />
              <TreeBranch name="App.jsx" description="라우터와 컨텍스트를 조립하는 루트 루트" />
              <TreeBranch name="main.jsx" description="[The Entry] 프로젝트가 시작되는 핵심 입구" isLast={true} />
            </TreeBranch>
          </div>
        </div>

        {/* Right: Key Philosophy Cards */}
        <div className="w-full lg:w-5/12 space-y-6">
          <div className="p-8 rounded-[32px] bg-theme-card border border-theme-border shadow-sm group hover:border-theme-accent transition-colors">
            <div className="p-3 rounded-2xl bg-theme-accent/5 text-theme-accent inline-block mb-6">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-theme-text-primary mb-3">Independent Maintenance</h3>
            <p className="text-sm text-theme-text-secondary leading-relaxed font-medium">
              각 파일은 독립적으로 관리됩니다. 에이전트가 특정 부분을 수정할 때 다른 로직을 건드리지 않도록 물리적으로 분리되어 있어 유지보수가 극도로 용이합니다.
            </p>
          </div>

          <div className="p-8 rounded-[32px] bg-theme-accent text-theme-bg shadow-lg group">
            <div className="p-3 rounded-2xl bg-white/10 text-white inline-block mb-6">
              <Settings className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-3">Modular Logic</h3>
            <p className="text-sm opacity-90 leading-relaxed font-medium">
              비즈니스 로직(Context), 디자인(Styles), 결과물(Pages)이 철저히 분리되어 있습니다. 이는 대규모 프로젝트에서도 스파게티 코드가 되는 것을 방지하는 핵심 전략입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
