import React from 'react';
import { Cpu, Github, Globe, Shield } from 'lucide-react';
import pkg from '../../package.json';

/**
 * 전역 푸터 컴포넌트
 */
const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-slate-200 py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-6">
              <Cpu className="text-indigo-600 w-6 h-6" />
              <span className="text-xl font-black text-slate-900 tracking-tighter">DUXX</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              최고의 기술력과 디자인으로 디지털 경험을 재정의합니다. 
              DUXX Project는 창의성과 성능의 조화를 추구합니다.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            <div>
              <h4 className="text-slate-900 font-bold mb-6">Platform</h4>
              <ul className="space-y-3 text-slate-500 text-sm font-medium">
                <li className="hover:text-indigo-600 cursor-pointer hover:translate-x-1 transition-all">Overview</li>
                <li className="hover:text-indigo-600 cursor-pointer hover:translate-x-1 transition-all">Features</li>
                <li className="hover:text-indigo-600 cursor-pointer hover:translate-x-1 transition-all">Integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 font-bold mb-6">Resources</h4>
              <ul className="space-y-3 text-slate-500 text-sm font-medium">
                <li className="hover:text-indigo-600 cursor-pointer hover:translate-x-1 transition-all">Documentation</li>
                <li className="hover:text-indigo-600 cursor-pointer hover:translate-x-1 transition-all">Help Center</li>
                <li className="hover:text-indigo-600 cursor-pointer hover:translate-x-1 transition-all">Status</li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-slate-900 font-bold mb-6">Connect</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 cursor-pointer transition-colors">
                  <Github className="w-5 h-5 text-slate-600" />
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 cursor-pointer transition-colors">
                  <Globe className="w-5 h-5 text-slate-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase">© 2026 DUXX Project. Digital Innovation.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-indigo-600 text-xs font-bold font-mono tracking-tight">Production Version: v{pkg.version}</p>
            </div>
          </div>
          <p className="text-slate-400 text-[10px] flex items-center gap-2 font-medium">
            <Shield className="w-3 h-3" /> Securing Your Vision
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
