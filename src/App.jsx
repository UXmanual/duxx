import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Github, Rocket, Palette, Globe, Layers, 
  Zap, Shield, Cpu, ChevronRight, Menu, X 
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

/**
 * Premium Button Component
 * @param {Object} props - Button properties
 */
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

/**
 * Main App Component - Ultra Premium Edition
 */
const App = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 font-sans antialiased overflow-x-hidden">
      
      {/* Dynamic Mesh Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen" 
        />
        <div className="absolute top-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[130px] rounded-full mix-blend-screen" />
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] bg-purple-600/10 blur-[140px] rounded-full mix-blend-screen" />
      </div>

      {/* Navigation Layer */}
      <nav className={`
        fixed top-0 w-full z-[100] transition-all duration-500 border-b
        ${isScrolled 
          ? 'py-4 bg-slate-950/80 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/50' 
          : 'py-6 bg-transparent border-transparent'}
      `}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <Cpu className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">DUXX</span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-10">
            {['Showcase', 'Solutions', 'Documentation', 'About'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="text-sm font-semibold text-slate-400 hover:text-white transition-all transform hover:-translate-y-0.5"
              >
                {item}
              </a>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white backdrop-blur-md hover:bg-white/10 transition-colors"
            >
              Sign In
            </motion.button>
          </div>
          
          <button className="md:hidden text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-48 pb-32">
        <section className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-12"
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

        {/* Bento Grid Feature Section */}
        <section className="max-w-7xl mx-auto px-6 mt-48">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
                Built for Excellence.
              </h2>
              <p className="text-slate-400 font-medium">단순한 코드 그 이상의 가치를 제공합니다. 업계 표준을 뛰어넘는 최고의 기술력을 경험하세요.</p>
            </div>
            <div className="flex gap-4">
              <div className="p-3 rounded-full border border-white/10 hover:bg-white/5 cursor-pointer transition-colors"><ChevronRight className="rotate-180 w-6 h-6 text-white" /></div>
              <div className="p-3 rounded-full border border-white/10 bg-white text-slate-900 cursor-pointer"><ChevronRight className="w-6 h-6" /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 h-auto md:h-[600px] gap-6">
            {/* Bento Item 1 - Large */}
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
                <p className="text-slate-400 text-lg leading-relaxed max-w-sm">Vercel Edge Network을 통해 세계 어디서나 0.1초의 응답 속도를 보장합니다. 지연 없는 웹 경험을 제공하세요.</p>
              </div>
            </motion.div>

            {/* Bento Item 2 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-2 p-10 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-sm relative group"
            >
              <div className="flex items-center gap-8 h-full">
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                    <Zap className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Turbo Boost</h3>
                  <p className="text-slate-400 text-sm">Vite 빌드 최적화로 <br />압도적인 성능 구현</p>
                </div>
                <div className="w-32 h-32 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform" />
              </div>
            </motion.div>

            {/* Bento Item 3 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-1 p-10 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-sm flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">Enterprise Security</h3>
                <p className="text-slate-400 text-xs">안전한 데이터 관리와 <br />암호화 솔루션</p>
              </div>
            </motion.div>

            {/* Bento Item 4 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-1 p-10 rounded-3xl bg-gradient-to-tr from-emerald-500/10 to-transparent border border-white/10 backdrop-blur-sm flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Palette className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">Design Freedom</h3>
                <p className="text-slate-400 text-xs">Tailwind 기반의 <br />완벽한 스타일링</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tech Stack Horizontal Scroll/Marquee Placeholder */}
        <section className="mt-48 py-20 bg-white/[0.02] border-y border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mb-12">Powered by modern industry standards</p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
               {['REACT', 'NEXT.JS', 'VITE', 'TAILWIND', 'VERCEL', 'GITHUB'].map(tech => (
                 <span key={tech} className="text-2xl md:text-3xl font-black text-white tracking-tighter">{tech}</span>
               ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-6 mt-48 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/10 blur-[100px] rounded-full -z-10" />
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Ready to Build Your <br />Dream Project?</h2>
          <p className="text-slate-400 text-lg mb-12 font-medium">지금 바로 DUXX와 함께 디지털 혁신을 시작하세요.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <GradientButton primary icon={Rocket}>Get Started Now</GradientButton>
            <button className="text-white font-bold underline underline-offset-8 hover:text-indigo-400 transition-colors">라이브 데모 보기</button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-6">
                <Cpu className="text-indigo-500 w-6 h-6" />
                <span className="text-xl font-black text-white tracking-tighter">DUXX</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                최고의 기술력과 디자인으로 디지털 경험을 재정의합니다. 
                DUXX Project는 창의성과 성능의 조화를 추구합니다.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
              <div>
                <h4 className="text-white font-bold mb-6">Platform</h4>
                <ul className="space-y-3 text-slate-500 text-sm font-medium">
                  <li className="hover:text-white cursor-pointer hover:translate-x-1 transition-all">Overview</li>
                  <li className="hover:text-white cursor-pointer hover:translate-x-1 transition-all">Features</li>
                  <li className="hover:text-white cursor-pointer hover:translate-x-1 transition-all">Integrations</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-6">Resources</h4>
                <ul className="space-y-3 text-slate-500 text-sm font-medium">
                  <li className="hover:text-white cursor-pointer hover:translate-x-1 transition-all">Documentation</li>
                  <li className="hover:text-white cursor-pointer hover:translate-x-1 transition-all">Help Center</li>
                  <li className="hover:text-white cursor-pointer hover:translate-x-1 transition-all">Status</li>
                </ul>
              </div>
              <div className="col-span-2 md:col-span-1">
                <h4 className="text-white font-bold mb-6">Connect</h4>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">
                    <Github className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-600 text-[10px] font-bold tracking-[0.2em] uppercase">© 2026 DUXX Project. Digital Innovation.</p>
            <p className="text-slate-500 text-[10px] flex items-center gap-2">
              <Shield className="w-3 h-3" /> Securing Your Vision
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
