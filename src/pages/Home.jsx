import React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Map, MapPin, Navigation, Layers, Compass, Search, ChevronRight, Globe, Zap, Shield, MousePointer2 } from 'lucide-react';

const GradientButton = ({ children, primary = false, icon: Icon }) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    className={`
      relative group px-10 py-5 rounded-3xl font-bold flex items-center gap-4 transition-all duration-500
      ${primary 
        ? 'bg-slate-900 text-white shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] hover:shadow-[0_30px_60px_-15px_rgba(15,23,42,0.4)]' 
        : 'bg-white text-slate-900 border border-slate-200/60 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.05)] hover:bg-slate-50'}
    `}
  >
    <span className="relative z-10 tracking-tight">{children}</span>
    {Icon && (
      <div className={`p-1.5 rounded-xl ${primary ? 'bg-white/10' : 'bg-blue-50'}`}>
        <Icon className={`w-4 h-4 ${primary ? 'text-white' : 'text-blue-600'}`} />
      </div>
    )}
  </motion.button>
);

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -12 }}
    className="relative p-10 rounded-[32px] bg-white/70 backdrop-blur-md border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_32px_64px_rgba(0,0,0,0.08)] transition-all duration-700 overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-150 transition-transform duration-1000">
      <Icon className="w-32 h-32 text-slate-900" />
    </div>
    <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100/50 mb-8 shadow-sm">
      <Icon className="w-7 h-7 text-blue-600" />
    </div>
    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-500 leading-relaxed font-medium">{description}</p>
  </motion.div>
);

const Home = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const springY1 = useSpring(y1, { stiffness: 100, damping: 30 });
  const springY2 = useSpring(y2, { stiffness: 100, damping: 30 });

  return (
    <div className="relative">
      {/* Topographic Background Pattern Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="topo" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M0 100 Q 50 50 100 100 T 200 100" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M0 150 Q 50 100 100 150 T 200 150" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M0 50 Q 50 0 100 50 T 200 50" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#topo)" />
        </svg>
      </div>

      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-48 px-6">
        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-6 py-2.5 rounded-2xl border border-blue-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-blue-600 text-xs font-black uppercase tracking-[0.3em] mb-12"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Spatial Intelligence v1.0.5
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-7xl md:text-[120px] font-black text-slate-950 leading-[0.9] tracking-[-0.04em] mb-12"
          >
            Explore <br />
            <span className="relative inline-block italic font-serif">
              New Limits
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                className="absolute -bottom-2 left-0 h-4 bg-blue-100 -z-10"
              />
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-500 leading-relaxed font-medium mb-16 px-4 tracking-tight"
          >
            단순한 지도를 넘어선 공간의 입체적 이해. <br />
            DUXX는 정밀한 공간 데이터를 통해 현실을 디지털로 재정의합니다.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8"
          >
            <GradientButton primary icon={Navigation}>Get Started</GradientButton>
            <GradientButton icon={Globe}>Watch Showcase</GradientButton>
          </motion.div>
        </div>

        {/* Parallax Floating Icons */}
        <motion.div style={{ y: springY1 }} className="absolute top-[20%] left-[5%] opacity-20 hidden lg:block">
          <Map className="w-24 h-24 text-blue-500 stroke-1" />
        </motion.div>
        <motion.div style={{ y: springY2 }} className="absolute bottom-[20%] right-[5%] opacity-20 hidden lg:block">
          <Compass className="w-32 h-32 text-indigo-500 stroke-1" />
        </motion.div>
      </section>

      {/* Feature Grid with Layout Sophistication */}
      <section className="max-w-7xl mx-auto px-6 mb-48 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <FeatureCard 
            icon={Map} 
            title="Advanced Topocore" 
            description="실제 지형의 미세한 굴곡까지 렌더링하는 초고정밀 엔진을 탑재했습니다."
            delay={0.1}
          />
          <FeatureCard 
            icon={Layers} 
            title="Infinite Layers" 
            description="수백만 개의 데이터 레이어를 지연 없이 중첩하여 분석할 수 있습니다."
            delay={0.2}
          />
          <FeatureCard 
            icon={MousePointer2} 
            title="Precision Control" 
            description="0.1mm 단위의 정밀한 좌표 제어와 인터랙티브 경험을 보장합니다."
            delay={0.3}
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
