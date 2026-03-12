import React from 'react';
import { Cpu, Github, Globe, Shield } from 'lucide-react';
import pkg from '../../package.json';

/**
 * 전역 푸터 컴포넌트
 */
const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-theme-border/50 py-32 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-20">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <Cpu className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-slate-950 tracking-tighter">DUXX</span>
            </div>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">
              We define the intersection of spatial data and high-end design. 
              Engineering reality into digital excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
            <div>
              <h4 className="text-slate-950 font-bold mb-8 uppercase tracking-widest text-xs">Platform</h4>
              <ul className="space-y-4 text-slate-500 text-sm font-semibold">
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Mapping Engine</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Data Analysis</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Developer API</li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-950 font-bold mb-8 uppercase tracking-widest text-xs">Resources</h4>
              <ul className="space-y-4 text-slate-500 text-sm font-semibold">
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Documentation</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Help Center</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Status</li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-slate-950 font-bold mb-8 uppercase tracking-widest text-xs">Connect</h4>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:shadow-lg transition-all cursor-pointer">
                  <Github className="w-5 h-5 text-slate-900" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:shadow-lg transition-all cursor-pointer">
                  <Globe className="w-5 h-5 text-slate-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-32 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase">© 2026 DUXX Project. All Rights Reserved.</p>
          
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-full bg-slate-100/50 border border-slate-200/50 backdrop-blur-md flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-slate-600 text-xs font-bold font-mono">Build v{pkg.version}</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs font-bold px-4 py-2">
              <Shield className="w-4 h-4" /> SSL Encrypted
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
