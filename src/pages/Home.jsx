import React from 'react';
import { FolderTree, FileCode, Settings, Layout } from 'lucide-react';

const DirectoryItem = ({ name, description, isFolder = true }) => (
  <div className="flex items-start gap-4 p-4 border-b border-theme-border last:border-0 hover:bg-theme-card-bg transition-colors">
    <div className={`mt-1 ${isFolder ? 'text-theme-accent' : 'text-theme-text-secondary'}`}>
      {isFolder ? <FolderTree className="w-5 h-5" /> : <FileCode className="w-5 h-5" />}
    </div>
    <div>
      <h4 className="font-bold text-theme-text-primary text-sm">{name}</h4>
      <p className="text-theme-text-secondary text-xs mt-1 leading-relaxed">{description}</p>
    </div>
  </div>
);

const Home = () => {
  return (
    <div className="pt-32 pb-48 max-w-4xl mx-auto px-6">
      <div className="mb-20 text-center">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-theme-badge-bg border border-theme-border text-theme-badge-text text-[10px] font-black tracking-widest uppercase">
          ✅ v1.1.1 THEME ENGINE CORRECTED
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-theme-text-primary tracking-tight mb-4">Project Architecture</h1>
        <p className="text-theme-text-secondary font-medium">현재 DUXX 프로젝트의 폴더 및 파일 관리 체계입니다.</p>
      </div>

      <div className="space-y-12">
        {/* Directory Structure Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 pb-2 border-b-2 border-theme-text-primary">
            <Layout className="w-5 h-5 text-theme-text-primary" />
            <h2 className="font-black uppercase tracking-widest text-sm text-theme-text-primary">Directory Structure</h2>
          </div>
          <div className="bg-theme-bg border border-theme-border rounded-2xl overflow-hidden shadow-sm">
            <DirectoryItem name="src/components/" description="공통 레이아웃 및 재사용 가능한 UI 컴포넌트 관리 (Header, Footer, Main 등)" />
            <DirectoryItem name="src/pages/" description="각 URL 경로별 독립 페이지 컴포넌트 (/home, /about 등)" />
            <DirectoryItem name="src/routes/" description="React Router를 이용한 페이지별 경로 설정 정의" />
            <DirectoryItem name="src/styles/" description="전역 스타일(global.css) 및 테마별 CSS(themes/*.css) 관리" />
            <DirectoryItem name="src/data/" description="내비게이션 메뉴 등 앱 전체에서 공유되는 정적 데이터(JSON)" />
          </div>
        </section>

        {/* CSS Management Rule Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 pb-2 border-b-2 border-theme-text-primary">
            <Settings className="w-5 h-5 text-theme-text-primary" />
            <h2 className="font-black uppercase tracking-widest text-sm text-theme-text-primary">CSS & Theme Rules</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl bg-theme-card-bg border border-theme-border">
              <h3 className="font-bold text-sm mb-4 text-theme-text-primary">global.css</h3>
              <ul className="text-xs text-theme-text-secondary space-y-3 list-disc ml-4">
                <li>레이아웃 뼈대 및 기본 리셋</li>
                <li>테마 불문 공통 애니메이션</li>
                <li>테마 파일 통합 임포트</li>
              </ul>
            </div>
            <div className="p-8 rounded-2xl bg-theme-card-bg border border-theme-border">
              <h3 className="font-bold text-sm mb-4 text-theme-text-primary">themes/*.css</h3>
              <ul className="text-xs text-theme-text-secondary space-y-3 list-disc ml-4">
                <li>모드별 색상/투명도 전용 변수</li>
                <li>데이터 기반의 시각화 스타일 분리</li>
                <li>배경색 및 텍스트 대비 정밀 제어</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
