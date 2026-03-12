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
          Unified PascalCase v1.2.6
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-theme-text-primary tracking-tighter mb-6 leading-tight">
          System <span className="text-theme-accent">Unification</span>
        </h1>
        <p className="text-theme-text-secondary text-lg font-medium max-w-3xl mx-auto leading-relaxed">
          모든 파일 명칭을 <strong>PascalCase</strong>로 통일했습니다. <br />
          명확한 명칭 부여를 통해 껍데기(Layout)와 알맹이(Main Content)가 완벽히 분리되었습니다.
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
            <TreeBranch name="src" description="Source root folder">
              <TreeBranch name="components" description="UI components library">
                <TreeBranch name="Layout.jsx" description="[The Shell] 껍데기 레이아웃 틀 (헤더/푸터)" />
                <TreeBranch name="Header.jsx" description="Navigation & Theme toggle" />
                <TreeBranch name="Footer.jsx" description="Site info & Build version" />
              </TreeBranch>

              <TreeBranch name="pages" description="Route-specific page content">
                <TreeBranch name="Main.jsx" description="[The Content] 이 페이지의 핵심 메인 콘텐츠" />
                <TreeBranch name="About.jsx" description="About us page" />
              </TreeBranch>

              <TreeBranch name="context" description="Global state logic">
                <TreeBranch name="ThemeContext.jsx" description="Theme persistence logic" />
              </TreeBranch>

              <TreeBranch name="styles" description="Visual style definition">
                <TreeBranch name="global.css" description="Global layout base" />
              </TreeBranch>

              <TreeBranch name="Index.jsx" description="[The Entry] 프로젝트의 유일한 진입점" isLast={true} />
            </TreeBranch>
          </div>
        </div>

        {/* Right: Key Philosophy Cards */}
        <div className="w-full lg:w-5/12 space-y-6">
          <div className="p-8 rounded-[32px] bg-theme-card border border-theme-border shadow-sm">
            <h3 className="text-lg font-bold text-theme-text-primary mb-3">PascalCase Rule</h3>
            <p className="text-sm text-theme-text-secondary leading-relaxed font-medium">
              모든 소스 파일의 첫 글자를 대문자로 통일하여 가독성을 높이고 리액트 관행을 준수합니다.
            </p>
          </div>
          <div className="p-8 rounded-[32px] bg-theme-accent text-theme-bg shadow-lg">
            <h3 className="text-lg font-bold mb-3">Logical Naming</h3>
            <p className="text-sm opacity-90 leading-relaxed font-medium">
              진입점은 Index, 껍데기는 Layout, 알맹이는 Main으로 명명하여 에이전트가 수정 범위를 오해하지 않도록 설계되었습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
