import React from 'react';
import pkg from '../../package.json';

const Footer = () => {
  return (
    <footer style={{ display: 'contents' }}>
      <div
        className="absolute left-0 px-10 z-[5] pointer-events-none"
        style={{ bottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex flex-col items-start gap-1 py-8 inline-block pointer-events-auto text-black opacity-30 select-none">
          <p className="text-[14px] font-bold tracking-[0]">v{pkg.version}</p>
          <p className="font-black text-[14px] tracking-[0] select-none">©Babble</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
