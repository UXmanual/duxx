import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Rocket, Github, Globe, Zap, Shield, Palette, ChevronRight } from 'lucide-react';

const GradientButton = ({ children, primary = false, icon: Icon }) => (
  <motion.button
    whileHover={{ scale: 1.02, translateY: -2 }}
    whileTap={{ scale: 0.98 }}
    className={`
      relative group px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300
      ${primary 
        ? 'bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]' 
        : 'bg-slate-900/50 text-white border border-white/10 backdrop-blur-md hover:bg-slate-800/80'}
    `}
  >
    {primary && (
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-indigo-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
    )}
    <span className="relative z-10">{children}</span>
    {Icon && <Icon className={`w-5 h-5 relative z-10 ${primary ? 'text-slate-900' : 'text-slate-400 group-hover:text-white'}`} />}
  </motion.button>
);

const Home = () => {
  return (
    <div className="pt-24 pb-32 overflow-hidden">
      <section className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-12"
        >
          <Sparkles className="w-3 h-3" />
          Next Gen Creative Engine
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-8xl lg:text-9xl font-black text-white leading-[1.05] tracking-tight mb-8"
        >
          Mastering the <br />
          <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">
            Future Web
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.8, duration: 1 }}
              className="absolute bottom-2 left-0 h-[8px] bg-indigo-500/20 -z-10 rounded-full"
            />
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto text-lg md:text-2xl text-slate-400 leading-relaxed font-medium mb-16 px-4"
        >
          Vercel과 React 기반의 초고밀도 성능, Tailwind CSS의 무한한 확장성. 
          DUXX는 당신의 상상을 한계를 넘어선 디지털 현실로 구축합니다.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <GradientButton primary icon={Rocket}>시작하기</GradientButton>
          <GradientButton icon={Github}>저장소 보기</GradientButton>
        </motion.div>
      </section>

      {/* Bento Grid Section */}
      <section className="max-w-7xl mx-auto px-6 mt-48">
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 h-auto md:h-[600px] gap-6">
          <motion.div 
            whileHover={{ y: -10 }}
            className="md:col-span-2 md:row-span-2 p-10 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-transparent border border-white/10 backdrop-blur-sm relative overflow-hidden group flex flex-col justify-end"
          >
            <div className="absolute top-0 right-0 p-12 opacity-50 group-hover:scale-110 transition-transform duration-700">
              <Globe className="w-48 h-48 text-indigo-500/20" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-8 border border-indigo-500/30">
                <Globe className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4">Global Infrastructure</h3>
              <p className="text-slate-400 text-lg leading-relaxed max-w-sm">Vercel Edge Network을 통해 세계 어디서나 0.1초의 응답 속도를 보장합니다.</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -10 }} className="md:col-span-2 p-10 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-sm">
            <h3 className="text-2xl font-black text-white mb-2">Turbo Boost</h3>
            <p className="text-slate-400 text-sm">Vite 빌드 최적화로 압도적인 성능 구현</p>
          </motion.div>

          <div className="md:col-span-1 p-10 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-sm">
            <Shield className="w-6 h-6 text-purple-400 mb-4" />
            <h3 className="text-xl font-black text-white mb-2">Security</h3>
          </div>
          
          <div className="md:col-span-1 p-10 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-sm">
            <Palette className="w-6 h-6 text-emerald-400 mb-4" />
            <h3 className="text-xl font-black text-white mb-2">Design</h3>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
