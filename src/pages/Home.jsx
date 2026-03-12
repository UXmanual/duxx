import React from 'react';
import { 
  FolderTree, FileCode, Settings, Layout, Layers, 
  Package, Globe, Code2, Database, Palette, AppWindow 
} from 'lucide-react';

const FileItem = ({ name, description }) => (
  <div className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-theme-bg transition-colors">
    <FileCode className="w-4 h-4 text-theme-text-secondary" />
    <span className="text-[11px] font-bold text-theme-text-primary min-w-[120px]">{name}</span>
    <span className="text-[10px] text-theme-text-secondary font-medium">{description}</span>
  </div>
);

const DirectoryGroup = ({ title, icon: Icon, description, files, folders }) => (
  <div className="bg-theme-card border border-theme-border rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all">
    <div className="p-6 border-b border-theme-border bg-theme-bg/30">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-theme-accent/10 text-theme-accent">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-black text-theme-text-primary tracking-tight">{title}</h3>
      </div>
      <p className="text-xs text-theme-text-secondary font-medium pl-11">{description}</p>
    </div>
    <div className="p-4 space-y-1">
      {files && files.map((file, idx) => (
        <FileItem key={idx} name={file.name} description={file.desc} />
      ))}
      {folders && folders.map((folder, idx) => (
        <div key={idx} className="mt-4 pt-4 border-t border-theme-border/50">
          <div className="flex items-center gap-2 px-4 mb-2">
            <FolderTree className="w-3 h-3 text-theme-accent" />
            <span className="text-[11px] font-black text-theme-text-primary uppercase tracking-widest">{folder.name}/</span>
          </div>
          <div className="space-y-1">
            {folder.files.map((ff, fidx) => (
              <FileItem key={fidx} name={ff.name} description={ff.desc} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Home = () => {
  return (
    <div className="pt-40 pb-48 max-w-6xl mx-auto px-6">
      <div className="mb-24 text-center">
        <div className="inline-block px-5 py-2 mb-8 rounded-full bg-theme-badge-bg border border-theme-border text-theme-badge-text text-[11px] font-black tracking-[0.2em] uppercase shadow-sm">
          Project Deep Dive v1.1.5
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-theme-text-primary tracking-tighter mb-6 leading-tight">
          Inside <span className="text-theme-accent">DUXX</span>
        </h1>
        <p className="text-theme-text-secondary text-lg font-medium max-w-3xl mx-auto leading-relaxed">
          DUXX 프로젝트의 모든 코드는 '명확한 역할'과 '유지보수성'을 기준으로 배치됩니다. <br />
          <code>src</code> 디렉토리 내부의 모든 파일과 폴더의 구조를 한눈에 확인하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Core & Entry */}
        <DirectoryGroup 
          title="Core & App Entry"
          icon={AppWindow}
          description="애플리케이션의 시작점과 메인 설정을 포함합니다."
          files={[
            { name: "main.jsx", desc: "React 앱의 진입점. Vite가 가장 먼저 호출하며 App을 렌더링합니다." },
            { name: "App.jsx", desc: "최상위 컴포넌트. 라우터 설정 및 모든 페이지의 데이터 흐름이 시작됩니다." }
          ]}
        />

        {/* Components */}
        <DirectoryGroup 
          title="Components"
          icon={Layout}
          description="재사용 가능한 UI 요소를 독립된 모듈로 관리합니다."
          files={[
            { name: "Main.jsx", desc: "전역 페이지 레이아웃 프레임워크. 공통 배경 및 래퍼 역할을 합니다." },
            { name: "Header.jsx", desc: "상단 내비게이션 바. 링크 및 테마 전환 로직을 포함합니다." },
            { name: "Footer.jsx", desc: "하단 정보 섹션. 소셜 링크, 버전 관리, 제작 정보를 담고 있습니다." }
          ]}
        />

        {/* Pages */}
        <DirectoryGroup 
          title="Pages"
          icon={Code2}
          description="각 경로(URL)별로 렌더링되는 독립적인 화면 컴포넌트입니다."
          files={[
            { name: "Home.jsx", desc: "메인 대시보드. 현재 보고 계시는 프로젝트 구조 가이드를 렌더링합니다." },
            { name: "About.jsx", desc: "서비스의 정체성과 비전을 설명하는 소개 페이지입니다." }
          ]}
        />

        {/* Styles & Themes */}
        <DirectoryGroup 
          title="Styles & Themes"
          icon={Palette}
          description="프로젝트의 시각적 언어와 테마 시스템을 관리합니다."
          files={[
            { name: "global.css", desc: "메인 스타일 시트. 테일윈드 설정 및 라이트/다크 통합 변수를 관리합니다." }
          ]}
          folders={[
            {
              name: "themes",
              files: [
                { name: "light.css", desc: "라이트 모드 전용 컬러 값 (global.css로 통합됨)." },
                { name: "dark.css", desc: "다크 모드 전용 컬러 값 (global.css로 통합됨)." }
              ]
            }
          ]}
        />

        {/* Router & Config */}
        <DirectoryGroup 
          title="Router & Business Logic"
          icon={Settings}
          description="경로 설정 및 프로젝트 동작에 필요한 시스템 설정을 담당합니다."
          folders={[
            {
              name: "routes",
              files: [
                { name: "index.jsx", desc: "React Router 경로 정의. 각 페이지 컴포넌트를 URL에 매핑합니다." }
              ]
            },
            {
              name: "data",
              files: [
                { name: "navigation.json", desc: "내비게이션 메뉴 이름 및 이동 경로를 담은 정적 데이터입니다." }
              ]
            }
          ]}
        />
      </div>

      {/* Philosophy Section */}
      <section className="mt-32 p-10 rounded-[40px] bg-theme-accent text-theme-bg overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 transition-transform group-hover:rotate-0 duration-700">
          <Database className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-black mb-6 tracking-tighter italic">Developer Experience First.</h2>
          <p className="font-bold text-lg opacity-90 leading-relaxed mb-8">
            모든 파일은 3초 안에 그 역할을 이해할 수 있도록 명명되었습니다. <br />
            이러한 체계적인 구조는 대규모 협업 프로젝트에서의 실수를 방지하고 <br />
            가장 빠른 개발 속도를 보장합니다.
          </p>
          <div className="flex gap-4">
            <div className="px-4 py-2 border border-theme-bg/30 rounded-full text-xs font-black uppercase tracking-widest">
              Zero Hardcoding
            </div>
            <div className="px-4 py-2 border border-theme-bg/30 rounded-full text-xs font-black uppercase tracking-widest">
              Contextual Theme
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
