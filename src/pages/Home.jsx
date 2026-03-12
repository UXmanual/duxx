import React from 'react';
import { FolderTree, FileCode, Settings, Layout, Layers, Package, Globe } from 'lucide-react';

const DirectoryItem = ({ name, description, details }) => (
  <div className="group p-6 border-b border-theme-border last:border-0 hover:bg-theme-card transition-all duration-300 bg-theme-card">
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
          <div key={idx} className="flex items-center gap-2 text-[11px] text-theme-text-secondary font-semibold bg-theme-bg border border-theme-border px-3 py-1.5 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-theme-accent" />
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
          Deployment Verification v1.1.4
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-theme-text-primary tracking-tighter mb-6 leading-tight">
          Project <span className="text-theme-accent">Blueprint</span>
        </h1>
        <p className="text-theme-text-secondary text-lg font-medium max-w-2xl mx-auto leading-relaxed">
          현재 화면의 모든 요소는 테마 변수를 통해 렌더링되고 있습니다. <br />
          배경색과 텍스트색의 대비를 확인해 주세요.
        </p>
      </div>

      <div className="space-y-16">
        <section>
          <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-theme-text-primary">
            <Layers className="w-6 h-6 text-theme-accent" />
            <h2 className="font-black uppercase tracking-widest text-lg text-theme-text-primary">Architecture Guide</h2>
          </div>
          <div className="bg-theme-card border border-theme-border rounded-[32px] overflow-hidden shadow-sm">
            <DirectoryItem 
              name="src/components/" 
              description="공통 레이아웃 프레임워크 및 UI 컴포넌트" 
              details={["Header: 상단 내비 & 테마 토글", "Footer: 서비스 정보", "Main: 라우트 컨테이너"]}
            />
            <DirectoryItem 
              name="src/styles/" 
              description="CSS 아키텍처 및 테마 관리" 
              details={["global.css: 전역 스타일 통합 관리", "Hardcoding Zero 원칙 적용"]}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
