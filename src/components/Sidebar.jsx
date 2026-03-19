import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { X, Clock, MessageSquare, Trash2, Send, Coffee, MapPin, ChevronRight } from 'lucide-react';

/**
 * [Component] LNB 사이드바 / 모바일 바텀시트 (통합 v43.6)
 * @version 43.6
 * @description 지하철 도착 정보, 스타벅스 매장 정보, 메모 정보를 모두 처리하도록 복구 함
 */
const Sidebar = ({ 
  memo, 
  replies, 
  onClose, 
  onDelete, 
  onReplySubmit, 
  onPop,
  replyText, 
  setReplyText,
  formatDateTime,
  subwayArrivals,
  subwayFetchTime,
  starbucks
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const sheetHeight = useMotionValue(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // [반응형 대응] 모바일/PC 전환 시 높이값 강제 동기화
  useEffect(() => {
    const hasData = memo || subwayArrivals || starbucks;
    if (!hasData) {
      sheetHeight.set(0);
      return;
    }

    if (isMobile) {
      animate(sheetHeight, window.innerHeight * 0.45, { 
        type: 'spring', damping: 30, stiffness: 400 
      });
      document.body.style.overflow = 'hidden';
    } else {
      sheetHeight.set(window.innerHeight);
      document.body.style.overflow = 'auto';
    }
  }, [isMobile, memo, subwayArrivals, starbucks]);

  // 카운트다운 로직
  useEffect(() => {
    if (!memo?.popped_at) { setTimeLeft(''); return; }
    const update = () => {
      const poppedTime = new Date(memo.popped_at);
      const remainingMs = (30 * 60 * 1000) - (new Date() - poppedTime);
      if (remainingMs <= 0) { setTimeLeft('00:00'); return; }
      const mins = Math.floor(remainingMs / 60000);
      const secs = Math.floor((remainingMs % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [memo?.popped_at]);

  const handlePan = (e, info) => {
    if (!isMobile) return;
    let newH = sheetHeight.get() - info.delta.y;
    const maxH = windowHeight * 0.95;
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
    
    if (currentH > windowHeight * 0.65) {
      if (velocity > 400) animate(sheetHeight, halfH, snapTransition);
      else animate(sheetHeight, fullH, snapTransition);
    } else if (currentH > windowHeight * 0.2) {
      if (velocity > 400) animate(sheetHeight, 0, snapTransition).then(() => onClose());
      else if (velocity < -400) animate(sheetHeight, fullH, snapTransition);
      else animate(sheetHeight, halfH, snapTransition);
    } else {
      animate(sheetHeight, 0, snapTransition).then(() => onClose());
    }
  };

  // 지하철 도착 정보 카드 컴포넌트 (v41.1 기반)
  const SubwayArrivalCard = () => {
    if (!subwayArrivals) return null;
    if (subwayArrivals.loading) {
      return (
        <div className="p-8 flex flex-col items-center justify-center animate-pulse">
          <div className="w-12 h-12 bg-gray-100 rounded-full mb-4" />
          <p className="text-gray-400 font-bold">열차 정보를 가져오는 중...</p>
        </div>
      );
    }

    // 상행/하행 분리 및 우선순위 정렬
    const line1Arrivals = subwayArrivals.realtimeArrivalList || [];
    const upTrains = line1Arrivals.filter(t => t.updnLine === "상행").sort((a, b) => parseInt(a.barvlDt) - parseInt(b.barvlDt)).slice(0, 2);
    const downTrains = line1Arrivals.filter(t => t.updnLine === "하행").sort((a, b) => parseInt(a.barvlDt) - parseInt(b.barvlDt)).slice(0, 2);

    const TrainItem = ({ train, isNext = false }) => (
      <div className={`p-4 rounded-2xl border ${isNext ? 'bg-gray-50/50 border-gray-100' : 'bg-blue-50/50 border-blue-100'} transition-all`}>
        <div className="flex justify-between items-start mb-2">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${train.arrivalType === '다음열차' ? 'bg-gray-200 text-gray-500' : 'bg-blue-500 text-white animate-pulse'}`}>
            {train.arrivalType}
          </span>
          <span className="text-[11px] font-bold text-gray-400">{train.time ? '예측 정보 있음' : '진입 중'}</span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[15px] font-black text-gray-800">{train.dest} {train.direction}</p>
            <p className="text-[12px] font-bold text-blue-600">{train.status}</p>
          </div>
          <div className="text-right">
            <span className="text-[18px] font-black text-gray-900 tracking-tighter">
              {train.time}
            </span>
          </div>
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#3D53B3] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <span className="text-[18px] font-black">1</span>
          </div>
          <div>
            <h2 className="text-[20px] font-black text-gray-900">서울역</h2>
            <p className="text-[12px] font-bold text-gray-400">실시간 도착 정보 ({subwayFetchTime})</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-3">
            <h3 className="text-[14px] font-black text-gray-400 px-1">상행 (소요산 방면)</h3>
            {subwayArrivals.up?.length > 0 ? subwayArrivals.up.map((t, idx) => <TrainItem key={idx} train={t} isNext={idx > 0} />) : <div className="p-4 bg-gray-50 rounded-2xl text-center text-gray-400 font-bold text-sm">정보 없음</div>}
          </div>
          <div className="space-y-3">
            <h3 className="text-[14px] font-black text-gray-400 px-1">하행 (천안/인천 방면)</h3>
            {subwayArrivals.down?.length > 0 ? subwayArrivals.down.map((t, idx) => <TrainItem key={idx} train={t} isNext={idx > 0} />) : <div className="p-4 bg-gray-50 rounded-2xl text-center text-gray-400 font-bold text-sm">정보 없음</div>}
          </div>
        </div>
      </div>
    );
  };

  // 스타벅스 매장 카드
  const StarbucksCard = () => {
    if (!starbucks) return null;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#00704a] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-700/20">
            <Coffee size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-[20px] font-black text-gray-900 leading-tight">{starbucks.name}</h2>
            <p className="text-[12px] font-bold text-[#00704a]">리저브 매장</p>
          </div>
        </div>
        <div className="p-5 bg-green-50/50 border border-green-100 rounded-[24px] space-y-4">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-green-700 mt-0.5" />
            <p className="text-gray-700 font-medium text-[14px] leading-relaxed">{starbucks.address}</p>
          </div>
          <button className="w-full py-4 bg-white border border-green-100 rounded-2xl text-green-700 font-black text-[14px] flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all">
            길찾기 <ChevronRight size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {(memo || subwayArrivals || starbucks) && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] md:hidden cursor-pointer bg-transparent"
            onClick={onClose}
          />
          <motion.div 
            style={{ height: isMobile ? sheetHeight : '100vh' }}
            initial={isMobile ? { height: 0 } : { x: -400, opacity: 0 }}
            animate={isMobile ? {} : { x: 0, opacity: 1 }}
            exit={isMobile ? { height: 0 } : { x: -400, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className={`fixed z-[10000] bg-white shadow-2xl flex flex-col md:left-0 md:top-0 md:h-screen md:w-[380px] bottom-0 left-0 w-full rounded-t-[32px] md:rounded-none overflow-hidden`}
          >
            <motion.div 
              className={`flex-shrink-0 touch-none select-none relative z-30 bg-white ${isMobile ? 'cursor-grab active:cursor-grabbing' : ''}`}
              onPan={isMobile ? handlePan : undefined} onPanEnd={isMobile ? handlePanEnd : undefined}
            >
              <div className="px-6 pt-5 pb-4">
                {isMobile && <div className="w-full flex justify-center pb-6"><div className="w-14 h-1.5 bg-gray-100 rounded-full" /></div>}
                {!isMobile && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="logo-font text-[20px] font-black text-[#FF4D00]">BABBLE</span>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={20} className="text-gray-400" /></button>
                  </div>
                )}
              </div>
            </motion.div>

            <div className="flex-1 overflow-y-auto px-6 pb-20 custom-scrollbar">
              {memo && (
                <div className="space-y-6">
                  {/* 메모 컨텐츠 (기존 로직 유지) */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#FF4D00] rounded-2xl flex items-center justify-center text-white font-black">{memo.nickname?.charAt(0)}</div>
                    <div><p className="font-bold text-gray-900">{memo.nickname}</p><p className="text-[10px] text-gray-400">{formatDateTime(memo.created_at)}</p></div>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-[24px] border border-gray-100"><p className="text-gray-800 text-[15px] font-medium leading-relaxed">{memo.text}</p></div>
                  {replies.length > 0 && (
                    <div className="space-y-4 pt-6">
                      <h3 className="text-[14px] font-black text-gray-400 px-1">답글 {replies.length}</h3>
                      {replies.map(r => (
                        <div key={r.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="font-bold text-[13px] text-gray-900 mb-1">{r.nickname}</p>
                          <p className="text-[13px] text-gray-700">{r.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {subwayArrivals && <SubwayArrivalCard />}
              {starbucks && <StarbucksCard />}
              <div className="h-20" />
            </div>

            {memo && (
              <div className="px-6 py-5 bg-white border-t border-gray-100 flex-shrink-0 z-40 bg-white/80 backdrop-blur-md">
                <div className="relative flex items-center">
                  <input 
                    type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                    placeholder="말하고싶은 바블을 남겨주세요"
                    className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-200 rounded-[22px] text-[13px] font-bold focus:outline-none focus:ring-4 focus:ring-[#FF4D00]/10 focus:bg-white transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && onReplySubmit(memo.id)}
                  />
                  <button onClick={() => onReplySubmit(memo.id)} className="absolute right-1.5 w-11 h-11 bg-[#FF4D00] text-white rounded-2xl flex items-center justify-center active:scale-95 transition-transform"><Send size={18} strokeWidth={2.5} /></button>
                </div>
                {isMobile && <div style={{ height: 'env(safe-area-inset-bottom, 16px)' }} />}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
