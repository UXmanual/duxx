import React from 'react';
import { Sparkles, Github, Rocket, Palette } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * App 컴포넌트 - DUXX 프로젝트의 메인 프리미엄 랜딩 페이지
 * @returns {JSX.Element} DUXX 메인 인터페이스
 */
const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-hidden relative">
      {/* 배경 장식 노이즈/그라데이션 */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-amber-500/10 blur-[100px] rounded-full" />

      {/* 헤더/네비게이션 */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-md bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-black tracking-tighter text-white flex items-center gap-2"
          >
            <Sparkles className="text-amber-400 w-6 h-6" />
            DUXX
          </motion.div>
          <div className="flex gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Project</a>
            <a href="#" className="hover:text-white transition-colors">Resources</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* 메인 히어로 섹션 */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="flex flex-col items-center text-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold tracking-widest text-amber-400 uppercase">
              Brand New Repository
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black text-white leading-[1.1] tracking-tight"
          >
            Elevate Your <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-indigo-500 bg-clip-text text-transparent">
              Digital Experience
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed"
          >
            React와 Tailwind CSS를 활용한 최고의 성능과 디자인. 
            DUXX는 당신의 비전을 가장 현대적이고 혁신적인 방식으로 실현합니다.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mt-4"
          >
            <button className="px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <Rocket className="w-5 h-5" />
              시작하기
            </button>
            <button className="px-8 py-4 bg-slate-900 border border-white/10 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors flex items-center gap-2">
              <Github className="w-5 h-5" />
              저장소 동기화
            </button>
          </motion.div>
        </div>

        {/* 피처 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
          {[
            { icon: <Palette className="text-amber-400" />, title: 'Premium Design', desc: '세련된 애니메이션과 고품질의 타이포그래피를 제공합니다.' },
            { icon: <Rocket className="text-indigo-400" />, title: 'High Performance', desc: 'Vite와 React의 조합으로 한계 없는 속도를 경험하세요.' },
            { icon: <Sparkles className="text-emerald-400" />, title: 'Tailwind Power', desc: '유틸리티 클래스를 통한 자유로운 커스터마이징이 가능합니다.' }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm hover:border-white/10 transition-colors group"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm">
        <p>© 2026 DUXX Project. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
