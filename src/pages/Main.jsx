import React from 'react';

const Main = () => {
  return (
    <div className="w-full h-screen relative bg-theme-bg flex items-center justify-center overflow-hidden">
      {/* 이 영역이 지도로 채워질 공간입니다 */}
      <div className="absolute inset-0 bg-gradient-to-b from-theme-accent/5 to-transparent animate-pulse" />
      
      <div className="relative text-center z-10">
        <h1 className="text-4xl md:text-5xl font-black text-theme-text-primary tracking-tighter mb-4 opacity-20">
          Live Weather Map
        </h1>
        <p className="text-theme-text-secondary font-bold text-xs uppercase tracking-[0.3em] opacity-30">
          Engineering the viewport...
        </p>
      </div>
    </div>
  );
};

export default Main;
