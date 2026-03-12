import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Map, MapPin, Navigation, Layers, Compass, Search, ChevronRight, Globe, Zap, Shield } from 'lucide-react';

const GradientButton = ({ children, primary = false, icon: Icon }) => (
  <motion.button
    whileHover={{ scale: 1.02, translateY: -2 }}
    whileTap={{ scale: 0.98 }}
    className={`
      relative group px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300
      ${primary 
        ? 'bg-theme-text text-theme-bg shadow-xl shadow-indigo-200/50' 
        : 'bg-white/80 backdrop-blur-md text-theme-text border border-theme-border shadow-sm hover:bg-white'}
    `}
  >
    <span className="relative z-10">{children}</span>
    {Icon && <Icon className={`w-5 h-5 relative z-10 ${primary ? 'text-theme-bg' : 'text-theme-accent'}`} />}
  </motion.button>
);

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    whileHover={{ y: -10 }}
    className="p-8 rounded-3xl bg-white border border-theme-border shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 flex flex-col gap-4"
  >
    <div className="w-12 h-12 rounded-2xl bg-theme-accent/5 flex items-center justify-center border border-theme-accent/10">
      <Icon className="w-6 h-6 text-theme-accent" />
    </div>
    <h3 className="text-xl font-black text-theme-text">{title}</h3>
    <p className="text-theme-text-muted leading-relaxed text-sm">{description}</p>
  </motion.div>
);

const Home = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  return (
    <div className="pb-32 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
        {/* Decorative Map Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute top-[20%] left-[10%] w-[80%] h-[60%] border border-theme-accent/10 rounded-full blur-3xl wave-animation" />
        </div>

        <motion.div style={{ opacity, scale }} className="z-10 text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-theme-accent/20 bg-theme-accent/5 text-theme-accent text-xs font-bold uppercase tracking-[0.2em] mb-12 shadow-sm"
          >
            <MapPin className="w-3 h-3 animate-bounce" />
            Precise Location intelligence
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-9xl font-black text-theme-text leading-[0.95] tracking-tight mb-10"
          >
            Mapping the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Future Path
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto text-lg md:text-2xl text-theme-text-muted leading-relaxed font-medium mb-16 px-4"
          >
            당신의 공간이 데이터가 되고, 지능이 됩니다. <br className="hidden md:block" />
            DUXX Maps는 고도화된 공간 분석 기술로 세상의 모든 좌표를 연결합니다.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <GradientButton primary icon={Navigation}>탐색 시작하기</GradientButton>
            <GradientButton icon={Search}>지역 검색</GradientButton>
          </motion.div>
        </motion.div>

        {/* Floating Interactive Element (Mock Map View) */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, type: 'spring' }}
          className="mt-24 relative w-full max-w-6xl aspect-[21/9] rounded-[40px] bg-white border border-theme-border shadow-2xl overflow-hidden group"
        >
          <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px] opacity-50" />
            <div className="flex flex-col items-center gap-4 text-theme-text-muted opacity-40 group-hover:opacity-60 transition-opacity">
              <Globe className="w-24 h-24 stroke-1 animate-spin-slow" />
              <p className="font-mono text-xs uppercase tracking-widest text-theme-text">Interactive Map Loading...</p>
            </div>
          </div>
          <div className="absolute top-8 left-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center"><Navigation className="w-5 h-5 text-indigo-600" /></div>
            <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center"><Layers className="w-5 h-5 text-slate-400" /></div>
            <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center"><Compass className="w-5 h-5 text-slate-400" /></div>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 mt-48">
        <div className="text-center mb-24">
          <h2 className="text-3xl md:text-5xl font-black text-theme-text mb-6">Explore the Platform</h2>
          <p className="text-theme-text-muted text-lg max-w-2xl mx-auto">차세대 공간 데이터 기술로 비즈니스의 위치 가치를 극대화합니다.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Globe} 
            title="Real-time Sync" 
            description="전 세계 데이터를 1초 미만의 지연 시간으로 실시간 동기화합니다."
            delay={0.1}
          />
          <FeatureCard 
            icon={Zap} 
            title="Edge Computing" 
            description="가장 가까운 엣지 노드에서 데이터를 처리하여 압도적인 반응 속도를 제공합니다."
            delay={0.2}
          />
          <FeatureCard 
            icon={Shield} 
            title="Data Integrity" 
            description="오차 범위 0.01m 이내의 초정밀 위치 데이터를 보장합니다."
            delay={0.3}
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
