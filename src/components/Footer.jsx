import React from 'react';
import pkg from '../../package.json';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col items-start gap-1 backdrop-blur-sm bg-theme-bg/10 p-4 rounded-3xl border border-theme-border/10 inline-block pointer-events-auto">
          <p className="text-theme-text-primary font-black text-xs tracking-tighter opacity-80">
            ©DUXX
          </p>
          <p className="text-theme-text-secondary text-[10px] font-bold opacity-40">
            Build v{pkg.version.split('.').slice(0, 2).join('.')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
