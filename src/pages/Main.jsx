import React from 'react';
import { 
  FolderTree, Settings, Layers, Package, Cpu, 
  ShieldCheck, Zap, FileCode, CheckCircle2
} from 'lucide-react';
import DirectoryItem from '../components/home/DirectoryItem';

/**
 * [Standard Content] 메인 페이지
 * @description 독립 수정 원칙: 이 파일의 수정은 헤더/푸터에 어떠한 영향을 미치지 않음.
 */
const Main = () => {
  return (
    <div className="pt-40 pb-48 max-w-6xl mx-auto px-6 font-sans">
      {/* 1. Header Section */}
      <div className="mb-24 text-center">
        <div className="inline-block px-5 py-2 mb-8 rounded-full bg-theme-accent/10 border border-theme-accent/20 text-theme-accent text-[11px] font-black tracking-[0.2em] uppercase shadow-sm">
          Project Standard v1.3.0
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-theme-text-primary tracking-tighter mb-6 leading-tight">
          Strictly <span className="text-theme-accent">Isolated</span>
        </h1>
        <p className="text-theme-text-secondary text-lg font-medium max-w-3xl mx-auto leading-relaxed">
          에이전트 수정 간 충돌 0%를 지향하는 물리적 격리 아키텍처입니다. <br />
          <b>Layout</b>은 틀만, <b>Main</b>은 알맹이만, <b>Logic</b>은 내부만 담당합니다.
        </p>
      </div>

      <div className="space-y-16">
        {/* 2. Isolation Guide List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[40px] bg-theme-card border border-theme-border hover:border-theme-accent transition-colors">
            <ShieldCheck className="w-8 h-8 text-theme-accent mb-6" />
            <h3 className="font-bold text-lg mb-2 text-theme-text-primary text-theme-text-primary">01. Header Isolation</h3>
            <p className="text-sm text-theme-text-secondary font-medium leading-relaxed italic border-l-2 border-theme-border pl-4">
              "헤더 배경색 바꿔줘" → Header.jsx만 수정됨. 본문 영향 없음.
            </p>
          </div>
          <div className="p-8 rounded-[40px] bg-theme-card border border-theme-border hover:border-theme-accent transition-colors">
            <Zap className="w-8 h-8 text-theme-accent mb-6" />
            <h3 className="font-bold text-lg mb-2 text-theme-text-primary">02. Content Isolation</h3>
            <p className="text-sm text-theme-text-secondary font-medium leading-relaxed italic border-l-2 border-theme-border pl-4">
              "메인 글자 키워줘" → Main.jsx만 수정됨. 푸터 영향 없음.
            </p>
          </div>
          <div className="p-8 rounded-[40px] bg-theme-card border border-theme-border hover:border-theme-accent transition-colors">
            <Settings className="w-8 h-8 text-theme-accent mb-6" />
            <h3 className="font-bold text-lg mb-2 text-theme-text-primary">03. Logic Isolation</h3>
            <p className="text-sm text-theme-text-secondary font-medium leading-relaxed italic border-l-2 border-theme-border pl-4">
              "테마 로직 고쳐줘" → ThemeContext만 수정됨. UI 구조 영향 없음.
            </p>
          </div>
        </div>

        {/* 3. Deep Dive Tree Section */}
        <div className="bg-theme-card border border-theme-border rounded-[48px] p-8 md:p-16 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 mb-12 pb-6 border-b border-theme-border">
            <div className="p-3 rounded-2xl bg-theme-text-primary text-theme-bg">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-theme-text-primary tracking-tight uppercase">Master Architecture Tree</h2>
              <p className="text-xs text-theme-accent font-black mt-1 uppercase tracking-widest">Confirmed Project Standard</p>
            </div>
          </div>

          <div className="bg-theme-bg/50 rounded-3xl p-6 border border-theme-border/50">
            {/* 트리 구조 가이드는 v1.2.7의 완벽한 전수 조사를 바탕으로 함 */}
            <div className="text-sm text-theme-text-secondary space-y-4">
              <div className="flex items-center justify-between p-4 bg-theme-card rounded-2xl border border-theme-border">
                <span className="font-black text-theme-text-primary">/src/components/Layout.jsx</span>
                <span className="text-[10px] bg-theme-accent/10 px-3 py-1 rounded-full text-theme-accent font-bold uppercase">Shell Only</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-theme-card rounded-2xl border border-theme-border">
                <span className="font-black text-theme-text-primary">/src/pages/Main.jsx</span>
                <span className="text-[10px] bg-theme-accent text-theme-bg px-3 py-1 rounded-full font-bold uppercase">Main Almi (Content)</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-theme-card rounded-2xl border border-theme-border">
                <span className="font-black text-theme-text-primary">/src/context/ThemeContext.jsx</span>
                <span className="text-[10px] bg-theme-text-primary text-theme-bg px-3 py-1 rounded-full font-bold uppercase">Engine Logic</span>
              </div>
            </div>
            
            <p className="mt-8 text-center text-xs text-theme-text-secondary font-bold opacity-60">
              * 모든 파일은 PascalCase를 따르며, 각 섹션은 독립적으로 관리됩니다.
            </p>

            {/* Added: Self-determined Layout Principle */}
            <div className="mt-12 pt-8 border-t border-theme-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-theme-accent/20 text-theme-accent">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="font-black text-theme-text-primary text-sm uppercase tracking-wide">Self-determined Layout Principle</h4>
              </div>
              <p className="text-[13px] text-theme-text-secondary leading-relaxed font-medium">
                <strong>레이아웃(Layout.jsx)</strong>은 디자인적 여백이나 크기를 강제하지 않는 'Dumb Shell' 역할을 수행하며, 
                실제 여백(padding), 너비(width), 중앙 정렬 등은 각 <strong>콘텐츠 페이지(Main.jsx 등)</strong>가 
                테일윈드 클래스를 통해 스스로 결정합니다. 이는 에이전트 수정 시 타 영역에 대한 의도치 않은 간섭을 기술적으로 완벽히 차단합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
