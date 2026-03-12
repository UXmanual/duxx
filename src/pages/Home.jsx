import React from 'react';
import { FolderTree, FileCode, Settings, Layout } from 'lucide-react';

const DirectoryItem = ({ name, description, isFolder = true }) => (
  <div className="flex items-start gap-4 p-4 border-b border-theme-border last:border-0">
    <div className={`mt-1 ${isFolder ? 'text-blue-500' : 'text-slate-400'}`}>
      {isFolder ? <FolderTree className="w-5 h-5" /> : <FileCode className="w-5 h-5" />}
    </div>
    <div>
      <h4 className="font-bold text-theme-text text-sm">{name}</h4>
      <p className="text-theme-text-muted text-xs mt-1">{description}</p>
    </div>
  </div>
);

const Home = () => {
  return (
    <div className="pt-32 pb-48 max-w-4xl mx-auto px-6">
      <div className="mb-20 text-center">
        <h1 className="text-4xl font-black text-theme-text tracking-tight mb-4">Project Architecture</h1>
        <p className="text-theme-text-muted font-medium">현재 DUXX 프로젝트의 폴더 및 파일 관리 체계입니다.</p>
      </div>

      <div className="space-y-12">
        {/* Directory Structure Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 pb-2 border-b-2 border-theme-text">
            <Layout className="w-5 h-5" />
            <h2 className="font-black uppercase tracking-widest text-sm">Directory Structure</h2>
          </div>
          <div className="bg-white border border-theme-border rounded-2xl overflow-hidden shadow-sm">
            <DirectoryItem name="src/components/" description="공통 레이아웃 및 재사용 가능한 UI 컴포넌트 관리 (Header, Footer, Main 등)" />
            <DirectoryItem name="src/pages/" description="각 URL 경로별 독립 페이지 컴포넌트 (/home, /about 등)" />
            <DirectoryItem name="src/routes/" description="React Router를 이용한 페이지별 경로 설정 정의" />
            <DirectoryItem name="src/styles/" description="전역 스타일(global.css) 및 테마별 CSS(themes/*.css) 관리" />
            <DirectoryItem name="src/data/" description="내비게이션 메뉴 등 앱 전체에서 공유되는 정적 데이터(JSON)" />
          </div>
        </section>

        {/* CSS Management Rule Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 pb-2 border-b-2 border-theme-text">
            <Settings className="w-5 h-5" />
            <h2 className="font-black uppercase tracking-widest text-sm">CSS & Theme Rules</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-slate-50 border border-theme-border">
              <h3 className="font-bold text-sm mb-3">global.css</h3>
              <ul className="text-xs text-theme-text-muted space-y-2 list-disc ml-4">
                <li>레이아웃 뼈대 (스크롤바, 폰트, 기본 리셋)</li>
                <li>공통 애니메이션 로직 정의</li>
                <li>테마 파일 임포트 (@import)</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-theme-border">
              <h3 className="font-bold text-sm mb-3">themes/*.css</h3>
              <ul className="text-xs text-theme-text-muted space-y-2 list-disc ml-4">
                <li>색상 및 투명도 등 테마별 상태 변수</li>
                <li>라이트/다크 모드별 독립적 디자인 정의</li>
                <li>상호 간섭 없는 모드 전환 데이터</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
