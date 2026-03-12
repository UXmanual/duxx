import React, { useState } from 'react';
import { 
  FolderTree, Settings, Layers, Package, Cpu, 
  ShieldCheck, Zap, FileCode, CheckCircle2, ChevronDown, ChevronUp,
  FileJson, Binary, AppWindow
} from 'lucide-react';

/* 트리 가지 컴포넌트 */
const TreeBranch = ({ name, description, isLast = false, children }) => (
  <div className="relative pl-6">
    {!isLast && <div className="absolute left-2.5 top-0 bottom-0 w-px bg-theme-border" />}
    <div className="relative flex items-start gap-3 py-2.5">
      <div className="absolute -left-3.5 top-5 w-3.5 h-px bg-theme-border" />
      <div className="mt-1 p-1 rounded-lg bg-theme-accent/10 text-theme-accent">
        {children ? <FolderTree className="w-3.5 h-3.5" /> : name.endsWith('.json') ? <FileJson className="w-3.5 h-3.5" /> : <Binary className="w-3.5 h-3.5" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`font-bold tracking-tight text-[13px] ${children ? 'text-theme-text-primary' : 'text-theme-accent'}`}>
            {name}{children ? '/' : ''}
          </span>
        </div>
        <p className="text-[10px] text-theme-text-secondary font-medium leading-relaxed italic line-clamp-1 group-hover:line-clamp-none transition-all">
          {description}
        </p>
        {children && <div className="mt-1.5 ml-0.5">{children}</div>}
      </div>
    </div>
  </div>
);

const Main = () => {
  const [isTreeOpen, setIsTreeOpen] = useState(true);

  return (
    <div className="pt-40 pb-48 max-w-6xl mx-auto px-6 font-sans">
      {/* 1. Header Section */}
      <div className="mb-20 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-theme-text-primary tracking-tighter mb-6 leading-tight">
          Absolute <span className="text-theme-accent">Standard</span>
        </h1>
        <p className="text-theme-text-secondary text-lg font-medium max-w-3xl mx-auto leading-relaxed">
          DUXX 아키텍처의 전수 조사 결과를 복구했습니다. <br />
          아코디언 기능을 통해 상세 구조를 언제든 확인하고 관리할 수 있습니다.
        </p>
      </div>

      <div className="space-y-12">
        {/* 2. Isolation Logic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[40px] bg-theme-card border border-theme-border flex flex-col items-center text-center">
            <ShieldCheck className="w-8 h-8 text-theme-accent mb-4" />
            <h3 className="font-bold text-base text-theme-text-primary">Strict Isolation</h3>
          </div>
          <div className="p-8 rounded-[40px] bg-theme-card border border-theme-border flex flex-col items-center text-center">
            <Zap className="w-8 h-8 text-theme-accent mb-4" />
            <h3 className="font-bold text-base text-theme-text-primary">Self-determined</h3>
          </div>
          <div className="p-8 rounded-[40px] bg-theme-card border border-theme-border flex flex-col items-center text-center">
            <Cpu className="w-8 h-8 text-theme-accent mb-4" />
            <h3 className="font-bold text-base text-theme-text-primary">No Interference</h3>
          </div>
        </div>

        {/* 3. Detailed Master Architecture Tree (with Accordion) */}
        <div className="bg-theme-card border border-theme-border rounded-[48px] overflow-hidden shadow-2xl transition-all duration-500">
          <button 
            onClick={() => setIsTreeOpen(!isTreeOpen)}
            className="w-full flex items-center justify-between p-10 md:px-16 hover:bg-theme-accent/5 transition-colors group"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 rounded-2xl bg-theme-text-primary text-theme-bg group-hover:bg-theme-accent transition-colors">
                <FolderTree className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-theme-text-primary tracking-tight uppercase">Detailed Structure Tree</h2>
                <p className="text-xs text-theme-accent font-black mt-1 uppercase tracking-widest">Global standard mapped</p>
              </div>
            </div>
            {isTreeOpen ? <ChevronUp className="w-8 h-8 text-theme-text-secondary" /> : <ChevronDown className="w-8 h-8 text-theme-text-secondary" />}
          </button>

          <div className={`px-8 md:px-16 pb-16 transition-all duration-500 overflow-hidden ${isTreeOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-theme-bg/50 rounded-3xl p-8 border border-theme-border/50">
              <TreeBranch name="src" description="모든 개발 소스 코드가 집결된 루트 폴더" isLast={true}>
                <TreeBranch name="components" description="UI 리소스 저장소: 재사용 가능한 UI 독립 관리">
                  <TreeBranch name="home" description="Main 전용 부품들">
                    <TreeBranch name="DirectoryItem.jsx" description="트리 항목 디자인 정의" isLast={true} />
                  </TreeBranch>
                  <TreeBranch name="Layout.jsx" description="[Shell] 헤더/푸터 레이아웃 틀" />
                  <TreeBranch name="Header.jsx" description="내비게이션 및 테마 스위치" />
                  <TreeBranch name="Footer.jsx" description="정보, 배포 시각, 버전 출력" isLast={true} />
                </TreeBranch>

                <TreeBranch name="pages" description="URL 이동에 따른 화면 페이지">
                  <TreeBranch name="Main.jsx" description="[Core] 현재 페이지 (콘텐츠 알맹이)" />
                  <TreeBranch name="About.jsx" description="서비스 정체성 소개" isLast={true} />
                </TreeBranch>

                <TreeBranch name="context" description="Logic Engine: 상태 로직 격리">
                  <TreeBranch name="ThemeContext.jsx" description="다크모드 영속성 제어" isLast={true} />
                </TreeBranch>

                <TreeBranch name="styles" description="Design Tokens">
                  <TreeBranch name="themes" description="독립된 컬러 시트">
                    <TreeBranch name="light.css" description="Base Color Tokens" />
                    <TreeBranch name="dark.css" description="Shifted Night Theme" isLast={true} />
                  </TreeBranch>
                  <TreeBranch name="global.css" description="전역 뼈대 스타일" isLast={true} />
                </TreeBranch>

                <TreeBranch name="data" description="JSON Assets">
                  <TreeBranch name="navigation.json" description="메뉴 구성 중앙 관리" isLast={true} />
                </TreeBranch>

                <TreeBranch name="Routes.jsx" description="URL-컴포넌트 매핑 로직" />
                <TreeBranch name="App.jsx" description="라우터/컨텍스트 조립 래퍼" />
                <TreeBranch name="Index.jsx" description="[Entry] 시스템 최상위 진입점" isLast={true} />
              </TreeBranch>

              {/* 자기 결정적 레이아웃 원칙 추가 복구 */}
              <div className="mt-12 pt-8 border-t border-theme-border">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-theme-accent" />
                  <h4 className="font-black text-theme-text-primary text-sm uppercase tracking-wide">Self-determined Layout Principle</h4>
                </div>
                <p className="text-[13px] text-theme-text-secondary leading-relaxed font-medium">
                  <strong>Layout.jsx</strong>는 여백이나 크기를 강제하지 않으며, 실제 레이아웃(Padding, Width 등)은 
                  <strong>콘텐츠 페이지(Main.jsx 등)</strong>가 테일윈드를 통해 스스로 정의합니다. 
                  이는 에이전트 수정 시 다른 영역에 대한 간섭을 물리적으로 차단하는 DUXX의 핵심 원칙입니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
