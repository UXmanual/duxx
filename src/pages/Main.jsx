import React from 'react';

const Main = () => {
  return (
    <div className="w-full h-screen relative bg-slate-200 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
      {/* 지도 영역을 시각적으로 구분하기 위한 그리드 패턴 추가 */}
      <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.2]" 
           style={{ 
             backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', 
             backgroundSize: '32px 32px' 
           }} 
      />
      
      <div className="relative text-center z-10">
        <div className="inline-block px-4 py-1 rounded-full bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">
          Map Viewport Area
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-400 dark:text-slate-700 tracking-tighter mb-2 italic">
          Map Engine Ready
        </h1>
        <p className="text-slate-500 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em]">
          Waiting for live data...
        </p>
      </div>
    </div>
  );
};

export default Main;
