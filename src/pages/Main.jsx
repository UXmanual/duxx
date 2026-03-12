import React from 'react';
import { Layers, Settings, Package, Globe } from 'lucide-react';
import DirectoryItem from '../components/home/DirectoryItem';

/**
 * 메인 콘텐츠 페이지 (기존 Home)
 * @description 사이트의 핵심 내용을 담고 있는 메인 화면입니다.
 */
const Main = () => {
  return (
    <div className="pt-40 pb-48 max-w-6xl mx-auto px-6">
      <div className="mb-24 text-center">
        <div className="inline-block px-5 py-2 mb-8 rounded-full bg-theme-badge-bg border border-theme-border text-theme-badge-text text-[11px] font-black tracking-[0.2em] uppercase shadow-sm">
          Core Identity v1.1.9
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-theme-text-primary tracking-tighter mb-6 leading-tight">
          Main <span className="text-theme-accent">Content</span>
        </h1>
        <p className="text-theme-text-secondary text-lg font-medium max-w-3xl mx-auto leading-relaxed">
          껍데기(Layout) 안에 담긴 핵심 콘텐츠 조각입니다. <br />
          역할에 따라 파일을 분리하여 에이전트 간의 관여를 방지합니다.
        </p>
      </div>

      <div className="space-y-16">
        {/* 1. Core Structure Breakdown */}
        <section>
          <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-theme-text-primary">
            <Layers className="w-6 h-6 text-theme-accent" />
            <h2 className="font-black uppercase tracking-widest text-lg text-theme-text-primary">Role Separation</h2>
          </div>
          <div className="bg-theme-border rounded-[32px] overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-2 gap-[1px]">
            <DirectoryItem 
              name="src/components/Layout.jsx" 
              description="[The Shell] 헤더, 푸터를 포함한 전체 페이지의 레이아웃 틀을 유지합니다." 
              details={["고정된 요소 관리", "페이지 간 공통 UI"]}
            />
            <DirectoryItem 
              name="src/pages/Main.jsx" 
              description="[The Content] 현재 보고 계신 메인 화면의 실제 내용을 담당합니다." 
              details={["비즈니스 로직 연동", "핵심 정보 렌더링"]}
            />
            <DirectoryItem 
              name="src/Index.jsx" 
              description="[The Entry] 앱을 구동하고 테마/라우터를 초기화하는 마법의 시작점입니다." 
            />
            <DirectoryItem 
              name="src/Routes.jsx" 
              description="[The Map] 어떤 페이지(Main, About)를 어떤 틀(Layout)에 담을지 지시합니다." 
            />
          </div>
        </section>

        {/* 2. Management Rules */}
        <section>
          <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-theme-text-primary">
            <Settings className="w-6 h-6 text-theme-accent" />
            <h2 className="font-black uppercase tracking-widest text-lg text-theme-text-primary">Agent Safety Rules</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-[32px] bg-theme-card border border-theme-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-theme-accent/5 text-theme-accent"><Package className="w-6 h-6" /></div>
                <h3 className="font-bold text-lg text-theme-text-primary">Independent Editing</h3>
              </div>
              <p className="text-sm text-theme-text-secondary leading-relaxed font-medium">
                에이전트가 "메인 내용을 수정해줘"라고 요청받으면 <code>src/pages/Main.jsx</code>만 수정하게 됩니다. 이는 거실 가구를 옮기면서 벽을 허물지 않는 것과 같습니다.
              </p>
            </div>
            <div className="p-8 rounded-[32px] bg-theme-card border border-theme-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-theme-accent/5 text-theme-accent"><Globe className="w-6 h-6" /></div>
                <h3 className="font-bold text-lg text-theme-text-primary">Pure Semantic</h3>
              </div>
              <p className="text-sm text-theme-text-secondary leading-relaxed font-medium">
                모든 스타일은 클래스를 통해 제어합니다. 파일을 분리한 이유는 각 파일의 코드량을 줄여 에이전트의 이해도를 높이기 위함입니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Main;
