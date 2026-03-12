import React from 'react';
import { Cpu, Github, Globe, Shield } from 'lucide-react';
import pkg from '../../package.json';

/**
 * 전역 푸터 컴포넌트
 * @description 모든 하드코딩된 색상 클래스를 제거하고 테마 변수를 사용합니다.
 */
const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-theme-border py-32 bg-theme-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-20">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-theme-text-primary flex items-center justify-center">
                <Cpu className="text-theme-bg w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-theme-text-primary tracking-tighter">DUXX</span>
            </div>
            <p className="text-theme-text-secondary text-lg leading-relaxed font-medium">
              We define the intersection of spatial data and high-end design. 
              Engineering reality into digital excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
            <div>
              <h4 className="text-theme-text-primary font-bold mb-8 uppercase tracking-widest text-xs">Platform</h4>
              <ul className="space-y-4 text-theme-text-secondary text-sm font-semibold">
                <li className="hover:text-theme-accent cursor-pointer transition-colors">Mapping Engine</li>
                <li className="hover:text-theme-accent cursor-pointer transition-colors">Data Analysis</li>
                <li className="hover:text-theme-accent cursor-pointer transition-colors">Developer API</li>
              </ul>
            </div>
            <div>
              <h4 className="text-theme-text-primary font-bold mb-8 uppercase tracking-widest text-xs">Resources</h4>
              <ul className="space-y-4 text-theme-text-secondary text-sm font-semibold">
                <li className="hover:text-theme-accent cursor-pointer transition-colors">Documentation</li>
                <li className="hover:text-theme-accent cursor-pointer transition-colors">Help Center</li>
                <li className="hover:text-theme-accent cursor-pointer transition-colors">Status</li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-theme-text-primary font-bold mb-8 uppercase tracking-widest text-xs">Connect</h4>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-theme-card border border-theme-border flex items-center justify-center hover:shadow-lg transition-all cursor-pointer">
                  <Github className="w-5 h-5 text-theme-text-primary" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-theme-card border border-theme-border flex items-center justify-center hover:shadow-lg transition-all cursor-pointer">
                  <Globe className="w-5 h-5 text-theme-text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-32 pt-12 border-t border-theme-border flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-theme-text-secondary text-xs font-bold tracking-[0.2em] uppercase">© 2026 DUXX Project. All Rights Reserved.</p>
          
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-full bg-theme-badge-bg border border-theme-border flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-theme-accent"></span>
              </span>
              <p className="text-theme-text-primary text-[10px] font-black font-mono">Build v{pkg.version}</p>
            </div>
            <p className="text-theme-text-secondary text-[9px] font-bold opacity-50 uppercase tracking-tighter">
              Last Deployed: 2026-03-12 15:04 KST
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
