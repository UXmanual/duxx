import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Zap, Globe } from 'lucide-react';

const Showcase = () => {
  return (
    <div className="pt-48 pb-32 max-w-7xl mx-auto px-6">
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter"
      >
        Project <span className="text-indigo-500">Showcase</span>
      </motion.h1>
      <p className="text-slate-400 text-lg max-w-2xl mb-16">
        DUXX로 빌드된 상징적인 프로젝트들을 확인하세요. 각 프로젝트는 성능과 디자인의 극치를 보여줍니다.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="aspect-video bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            <div className="absolute bottom-6 left-6 text-white font-bold">Project 0{i}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Showcase;
