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
          <div className="flex items-center gap-3">
            <p className="text-[14px] font-bold tracking-[0]">
              Build v{pkg.version}
            </p>
          </div>
          <p className="text-[12px] font-semibold tracking-[0]">
            Last Deployed 2026-03-20 22:43 KST
          </p>
          <p className="font-black text-[14px] tracking-[0] select-none">
            짤Babble
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
