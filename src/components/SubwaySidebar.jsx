import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { X, Clock } from 'lucide-react';

/**
 * [Component] 지하철 실시간 정보 전용 LNB
 * @version 1.0 (Sidebar에서 추출)
 * @description 지하철 정보를 독립적으로 표시하여 다른 바블 정보와 간섭 없도록 함
 */
const SubwaySidebar = ({ 
  subwayData, 
  onClose 
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const sheetHeight = useMotionValue(0);
  const prevDataIdRef = useRef(null); // 데이터 변경 감지용

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!subwayData) {
      prevDataIdRef.current = null;
      return;
    }

    // 데이터가 새로 로드될 때만 (loading -> data 전환 시 등) 초기 높이 설정
    const isInitialLoad = !prevDataIdRef.current && !subwayData.loading;
    
    if (isMobile) {
      if (isInitialLoad || sheetHeight.get() === 0) {
        animate(sheetHeight, window.innerHeight * 0.45, { 
          type: 'spring', damping: 30, stiffness: 400 
        });
      }
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      sheetHeight.set(window.innerHeight);
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
    }

    if (!subwayData.loading) {
      prevDataIdRef.current = 'loaded';
    }
  }, [isMobile, !!subwayData, subwayData?.loading]);

  const handlePan = (e, info) => {
    if (!isMobile) return;
    let newH = sheetHeight.get() - info.delta.y;
    const maxH = windowHeight * 0.92;
    if (newH > maxH) newH = maxH;
    sheetHeight.set(newH);
  };

  const handlePanEnd = (e, info) => {
    if (!isMobile) return;
    const currentH = sheetHeight.get();
    const velocity = info.velocity.y;
    const snapTransition = { type: 'spring', damping: 38, stiffness: 450 };

    const halfH = windowHeight * 0.45;
    const fullH = windowHeight * 0.9;
    const threshold = windowHeight * 0.15;

    if (currentH > windowHeight * 0.65) {
      if (velocity > 400 || currentH < fullH - threshold) {
        animate(sheetHeight, halfH, snapTransition);
      } else {
        animate(sheetHeight, fullH, snapTransition);
      }
    } else if (currentH > windowHeight * 0.2) {
      if (velocity < -400 && currentH > halfH - threshold) {
        animate(sheetHeight, fullH, snapTransition);
      } else if (velocity > 400 || currentH < halfH - threshold) {
        animate(sheetHeight, 0, snapTransition).then(() => onClose());
      } else {
        animate(sheetHeight, halfH, snapTransition);
      }
    } else {
      if (velocity < -600) {
        animate(sheetHeight, halfH, snapTransition);
      } else {
        animate(sheetHeight, 0, snapTransition).then(() => onClose());
      }
    }
  };

  const SubwayHeaderInfo = () => (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-black text-gray-900">1호선 서울역</h2>
      <p className="text-[11px] font-bold text-[#3D53B3] flex items-center gap-1.5 py-1 px-3 bg-[#3D53B3]/10 rounded-full w-max">
        <div className="w-1.5 h-1.5 bg-[#3D53B3] rounded-full animate-pulse" />
        실시간 도착 정보 {subwayData.fetchTime && `(${subwayData.fetchTime})`}
      </p>
    </div>
  );

  if (!subwayData) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] md:hidden cursor-pointer"
        onClick={onClose}
      />
      
      <motion.div 
        style={{ height: isMobile ? sheetHeight : '100vh' }}
        variants={!isMobile ? {
          open: { x: 0, opacity: 1 },
          closed: { x: -400, opacity: 0 }
        } : {}}
        initial={isMobile ? { height: 0 } : "closed"}
        animate={!isMobile ? "open" : {}}
        exit={isMobile ? { height: 0 } : "closed"}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className="fixed z-[10000] bg-white shadow-2xl flex flex-col md:left-0 md:top-0 md:h-screen md:w-[380px] bottom-0 left-0 w-full rounded-t-[32px] md:rounded-none overflow-hidden"
      >
        {/* [Header Area] - 모바일에서는 이 구역 전체가 드래그 핸들 */}
        <motion.div 
          className={`flex-shrink-0 touch-none select-none relative z-30 bg-white ${isMobile ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onPan={isMobile ? handlePan : undefined}
          onPanEnd={isMobile ? handlePanEnd : undefined}
        >
          {isMobile ? (
            <div className="px-6 pt-5 pb-4 space-y-4">
              <div className="w-full flex justify-center pb-2">
                <div className="w-14 h-1.5 bg-gray-200 rounded-full" />
              </div>
              {!subwayData.loading && <SubwayHeaderInfo />}
            </div>
          ) : (
            <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center">
                <span className="logo-font text-[20px] tracking-[0] uppercase text-[#3D53B3] select-none">SUBWAY</span>
              </div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                <X size={20} />
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* [Scrollable Area] */}
        <div 
          className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-4 pb-6"
          onPointerDown={(e) => e.stopPropagation()} 
        >
          {subwayData.loading ? (
            <div className="h-40 flex flex-col gap-4 items-center justify-center bg-gray-50 rounded-2xl animate-pulse">
              <Clock size={24} className="text-gray-300 animate-spin" />
              <span className="text-xs font-bold text-gray-400">지하철 실시간 정보를 가져오고 있습니다...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-6 mb-2">
              {!isMobile && <SubwayHeaderInfo />}

              <div className="flex flex-col gap-6 py-2">
                {/* 상행 */}
                {subwayData.up?.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-black text-gray-500 rounded">상행</span>
                      <div className="flex-1 h-[1px] bg-gray-100" />
                    </div>
                    <div className="grid gap-3">
                      {subwayData.up.map((arrival, idx) => (
                        <div key={`side-up-${idx}`} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col gap-1.5 hover:border-[#3D53B3]/30 transition-colors relative overflow-hidden group">
                          <div className={`absolute top-0 left-0 w-1 h-full ${arrival.arrivalType === '이번열차' ? 'bg-[#3D53B3]' : 'bg-gray-300'}`} />
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-sm ${arrival.arrivalType === '이번열차' ? 'bg-[#3D53B3] text-white' : 'bg-gray-200 text-gray-600'}`}>
                              {arrival.arrivalType}
                            </span>
                            <span className="text-[11px] font-medium text-gray-400">{arrival.time}</span>
                          </div>
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-sm font-black text-gray-900">{arrival.dest}</span>
                            <span className="text-xs font-bold text-gray-400">{arrival.direction}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-bold text-[#3D53B3]">{arrival.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* 하행 그룹 생략 방지... (전체 포함) */}
                {subwayData.down?.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-black text-gray-500 rounded">하행</span>
                      <div className="flex-1 h-[1px] bg-gray-100" />
                    </div>
                    <div className="grid gap-3">
                      {subwayData.down.map((arrival, idx) => (
                        <div key={`side-down-${idx}`} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col gap-1.5 hover:border-[#3D53B3]/30 transition-colors relative overflow-hidden group">
                          <div className={`absolute top-0 left-0 w-1 h-full ${arrival.arrivalType === '이번열차' ? 'bg-[#3D53B3]' : 'bg-gray-300'}`} />
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-sm ${arrival.arrivalType === '이번열차' ? 'bg-[#3D53B3] text-white' : 'bg-gray-200 text-gray-600'}`}>
                              {arrival.arrivalType}
                            </span>
                            <span className="text-[11px] font-medium text-gray-400">{arrival.time}</span>
                          </div>
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-sm font-black text-gray-900">{arrival.dest}</span>
                            <span className="text-xs font-bold text-gray-400">{arrival.direction}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-bold text-[#3D53B3]">{arrival.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {subwayData.error && <p className="text-red-500 text-xs font-bold text-center py-4">{subwayData.error}</p>}
            </div>
          )}
          <div className="h-20" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubwaySidebar;
