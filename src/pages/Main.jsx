import React from 'react';
import { 
  FolderTree, Settings, Layout as LayoutIcon, 
  Layers, Package, Globe, Code2, Database, Palette, 
  AppWindow, ChevronRight, Binary, FileJson, Cpu
} from 'lucide-react';

const TreeBranch = ({ name, description, isLast = false, children }) => (
  <div className="relative pl-6">
    {/* Vertical Line */}
    {!isLast && <div className="absolute left-2.5 top-0 bottom-0 w-px bg-theme-border" />}
    
    <div className="relative flex items-start gap-3 py-3">
      {/* Horizontal connector line */}
      <div className="absolute -left-3.5 top-6 w-3.5 h-px bg-theme-border" />
      
      <div className="mt-1 p-1.5 rounded-lg bg-theme-accent/10 text-theme-accent">
        {children ? <FolderTree className="w-4 h-4" /> : name.endsWith('.json') ? <FileJson className="w-4 h-4" /> : <Binary className="w-4 h-4" />}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`font-bold tracking-tight text-sm ${children ? 'text-theme-text-primary' : 'text-theme-accent'}`}>
            {name}{children ? '/' : ''}
          </span>
        </div>
        <p className="text-[11px] text-theme-text-secondary font-medium mt-0.5 leading-relaxed">
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
    <div className="pt-40 pb-48 max-w-6xl mx-auto px-6 font-sans">
      <div className="mb-24 text-center">
        <div className="inline-block px-5 py-2 mb-8 rounded-full bg-theme-badge-bg border border-theme-border text-theme-badge-text text-[11px] font-black tracking-[0.2em] uppercase shadow-sm">
          Detailed Architecture v1.2.7
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-theme-text-primary tracking-tighter mb-6 leading-tight">
          Project <span className="text-theme-accent">Deep-Dive</span>
        </h1>
        <p className="text-theme-text-secondary text-lg font-medium max-w-3xl mx-auto leading-relaxed">
          DUXX 프로젝트의 모든 파일과 폴더를 전수 조사하여 각 역할을 상세히 기술했습니다. <br />
          에이전트 수정 간 충돌을 방지하기 위한 물리적 분리 원칙을 준수합니다.
        </p>
      </div>

      <div className="space-y-12">
        {/* Structure Tree Full Width Container */}
        <div className="bg-theme-card border border-theme-border rounded-[48px] p-8 md:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none transform rotate-12">
            <FolderTree className="w-96 h-96" />
          </div>

          <div className="flex items-center gap-4 mb-12 pb-6 border-b border-theme-border">
            <div className="p-3 rounded-2xl bg-theme-accent text-theme-bg">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-theme-text-primary tracking-tight uppercase">DUXX Source Architecture Tree</h2>
              <p className="text-xs text-theme-text-secondary font-bold mt-1 uppercase tracking-widest opacity-60">Full directory mapping & file responsibility</p>
            </div>
          </div>

          <div className="space-y-2">
            <TreeBranch name="src" description="Project Source Root: 모든 개발 소스 코드가 위치하는 최상위 디렉토리">
              
              <TreeBranch name="components" description="UI 리소스 저장소: 재사용 가능한 UI 조각들을 독립적으로 관리">
                <TreeBranch name="home" description="Page Components: 특정 페이지(Main) 내부에서만 사용되는 전용 부품들">
                  <TreeBranch name="DirectoryItem.jsx" description="[UI Component] 트리 구조의 각 항목 스타일과 레이아웃을 정의" />
                </TreeBranch>
                <TreeBranch name="Layout.jsx" description="[Structural Shell] 사이트의 기본 뼈대. 헤더, 푸터 상시 노출 및 Outlet 제어" />
                <TreeBranch name="Header.jsx" description="[Interactivity] 전역 메뉴 내비게이션 및 다크모드 토글 스위치 논리 포함" />
                <TreeBranch name="Footer.jsx" description="[Information] 하단 정보, 저작권, 빌드 버전 및 실시간 배포 시각 노출" />
              </TreeBranch>

              <TreeBranch name="pages" description="View Layer: 각 URL 경로에 따라 교체되는 독립적인 화면 페이지">
                <TreeBranch name="Main.jsx" description="[Primary View] 현재 보고 있는 아키텍처 가이드가 포함된 사이트의 얼굴" />
                <TreeBranch name="About.jsx" description="[Sub View] 서비스 소개 및 정체성을 고지하는 정적 페이지 전용" />
              </TreeBranch>

              <TreeBranch name="context" description="Logic Engine: 앱 전체에 적용되는 상태와 연산 로직을 물리적으로 격리">
                <TreeBranch name="ThemeContext.jsx" description="[State logic] 다크모드 상태 관리, LocalStorage 저장 및 시스템 테마 연동" />
              </TreeBranch>

              <TreeBranch name="styles" description="Design System: 시각적 가이드라인과 테마 토큰을 정의">
                <TreeBranch name="themes" description="Color Tokens: 라이트/다크 모드별 독립된 CSS 변수 시트">
                  <TreeBranch name="light.css" description="[Design Base] 백그라운드 화이트, 텍스트 슬레이트 등 기본 시각 정보 정의" />
                  <TreeBranch name="dark.css" description="[Design Override] .dark 클래스 활성화 시 교체되는 야간 모드 컬러 셋" />
                </TreeBranch>
                <TreeBranch name="global.css" description="[Infrastructure] 테일윈드 설정, 폰트 로딩, 스크롤바 디자인 등 전역 스타일" />
              </TreeBranch>

              <TreeBranch name="data" description="Asset Data: 정적 텍스트나 내비게이션 구성 정보를 JSON 형태로 관리">
                <TreeBranch name="navigation.json" description="[Single Source of Truth] 메뉴 이름과 경로를 중앙에서 관리하여 유지보수 효율화" />
              </TreeBranch>

              <TreeBranch name="Routes.jsx" description="[Navigation Map] 어떤 URL(/, /about)에 어떤 레이아웃과 페이지를 조합할지 결정" />
              <TreeBranch name="App.jsx" description="[Logic Wrapper] 브라우저 라우터 초기화 및 앱 전체를 관리 모듈로 감싸는 역할" />
              <TreeBranch name="Index.jsx" description="[System Entry] Vite 빌드 프로세스가 가장 먼저 읽는 최상위 진입 파일" isLast={true} />
            </TreeBranch>
          </div>
        </div>

        {/* Philosophy Footnote */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-[40px] bg-theme-accent/5 border border-theme-accent/20 flex gap-6 items-center">
            <div className="p-4 rounded-3xl bg-theme-accent text-theme-bg shadow-lg shadow-theme-accent/20">
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-text-primary mb-1">Decoupled Maintenance</h3>
              <p className="text-[13px] text-theme-text-secondary font-medium leading-relaxed">
                에이전트가 로직을 수정할 때 디자인을 건드리지 않도록 설계되었습니다. 각 브랜치는 독립적인 수정 영향권을 가집니다.
              </p>
            </div>
          </div>
          <div className="p-8 rounded-[40px] bg-theme-card border border-theme-border flex gap-6 items-center">
            <div className="p-4 rounded-3xl bg-theme-card border border-theme-border text-theme-text-primary shadow-sm">
              <Settings className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-text-primary mb-1">Management Standards</h3>
              <p className="text-[13px] text-theme-text-secondary font-medium leading-relaxed">
                모든 파일명은 PascalCase를 따르며, 확장자는 기능에 따라 .jsx와 .css, .json으로 명확히 구분됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
