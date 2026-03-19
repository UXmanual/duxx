import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { X, Clock, MessageSquare, Trash2, Send, Coffee, MapPin, ChevronRight, Info, RefreshCw } from 'lucide-react';

/**
 * [Component] LNB 사이드바 / 모바일 바텀시트 (시간표 고도화 v44.4)
 * @version 44.4
 * @description 
 * - 기능을 [바블/지하철/스타벅스] 세 가지 카테고리로 엄격하게 분리
 * - 지하철 섹션: 실시간 정보 대신 공식 시간표 UI 구축 (v44.4)
 */
const Sidebar = ({ 
  memo, replies = [], onClose, onDelete, onReplySubmit, onPop,
  replyText, setReplyText, formatDateTime, subwayArrivals,
  subwayFetchTime, onTimetableTabChange, starbucks
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const sheetHeight = useMotionValue(0);
  const contentRef = useRef(null);

  // 컨텐츠 전환 시 스크롤 맨 위로 초기화 (v44.9)
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [memo?.id, subwayArrivals?.dayType, starbucks?.id]);

  // --------------------------------------------------------------------------
  // [공통 인프라] - 수정 금지 (프레임워크 영역)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const handleResize = () => { setIsMobile(window.innerWidth < 768); setWindowHeight(window.innerHeight); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const hasData = memo || subwayArrivals || starbucks;
    if (!hasData) { sheetHeight.set(0); return; }
    if (isMobile) {
      animate(sheetHeight, window.innerHeight * 0.45, { type: 'spring', damping: 30, stiffness: 400 });
      document.body.style.overflow = 'hidden';
    } else {
      sheetHeight.set(window.innerHeight);
      document.body.style.overflow = 'auto';
    }
  }, [isMobile, memo, subwayArrivals, starbucks]);

  const handlePan = (e, info) => { if (!isMobile) return; let newH = sheetHeight.get() - info.delta.y; if (newH > windowHeight * 0.95) newH = windowHeight * 0.95; sheetHeight.set(newH); };
  const handlePanEnd = (e, info) => { if (!isMobile) return; const currentH = sheetHeight.get(); const velocity = info.velocity.y; const snapTransition = { type: 'spring', damping: 38, stiffness: 450 }; const halfH = windowHeight * 0.45; const fullH = windowHeight * 0.9; if (currentH > windowHeight * 0.65) { if (velocity > 400) animate(sheetHeight, halfH, snapTransition); else animate(sheetHeight, fullH, snapTransition); } else if (currentH > windowHeight * 0.2) { if (velocity > 400) animate(sheetHeight, 0, snapTransition).then(() => onClose()); else if (velocity < -400) animate(sheetHeight, fullH, snapTransition); else animate(sheetHeight, halfH, snapTransition); } else { animate(sheetHeight, 0, snapTransition).then(() => onClose()); } };

  // --------------------------------------------------------------------------
  // [CATEGORY 1: BABBLE MEMO]
  // --------------------------------------------------------------------------
  const MemoSection = () => {
    if (!memo) return null;
    const sortedReplies = [...(replies || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    useEffect(() => {
      if (!memo.popped_at) { setTimeLeft(''); return; }
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
    }, [memo.popped_at]);

    return (
      <div className="space-y-6 category-babble animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF4D00] to-[#FF8A00] rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-[#FF4D00]/20">{memo.nickname?.charAt(0)}</div>
            <div><p className="font-bold text-gray-900 leading-tight">{memo.nickname}</p><p className="text-[10px] text-gray-400 font-medium">{formatDateTime(memo.created_at)}</p></div>
          </div>
          {!memo.popped_at && (
            <button onClick={(e) => { e.stopPropagation(); onPop(memo.id, e); }} className="p-2.5 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all active:scale-90">
              <motion.svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4D00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" animate={{ scale: [1, 0.85, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41" />
              </motion.svg>
            </button>
          )}
        </div>
        <div className="p-5 bg-gray-50 rounded-[24px] border border-gray-100"><p className="text-gray-800 text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{memo.text}</p></div>
        <div className="flex items-center gap-4 text-[10px] font-bold px-1">
          <span className={`flex items-center gap-1.5 ${memo.popped_at ? 'text-[#FF4D00]' : 'text-blue-500'}`}><div className={`w-1.5 h-1.5 rounded-full animate-pulse ${memo.popped_at ? 'bg-[#FF4D00]' : 'bg-blue-500'}`} />{memo.popped_at ? `${timeLeft} 후 소멸` : '활성화 상태'}</span>
          <span className="flex items-center gap-1.5 text-gray-400"><MessageSquare size={12} strokeWidth={2.5} /> 답글 {replies.length}</span>
        </div>
        {replies.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-gray-50">
            <h3 className="text-[14px] font-black text-gray-400 px-1">답글 {replies.length}</h3>
            {sortedReplies.map(r => (
              <div key={r.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-start mb-1"><p className="font-bold text-[13px] text-gray-900">{r.nickname}</p><span className="text-[10px] text-gray-400 font-medium">{formatDateTime(r.created_at)}</span></div>
                <p className="text-[13px] text-gray-700 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // [CATEGORY 2: SUBWAY TIMETABLE] - 지하철 시간표 고도화 (v44.4)
  // --------------------------------------------------------------------------
  const SubwaySection = () => {
    if (!subwayArrivals) return null;
    const hourScrollRef = useRef(null);
    const currentHour = new Date().getHours();
    const [selectedHour, setSelectedHour] = useState(currentHour);

    useEffect(() => {
      // 컴포넌트 마운트 시 현재 시간 버튼으로 가로 스크롤 이동 (v44.7)
      if (hourScrollRef.current) {
        const activeBtn = hourScrollRef.current.querySelector(`#btn-hour-${currentHour}`);
        if (activeBtn) {
          activeBtn.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
        }
      }
    }, [subwayArrivals.loading]); // 데이터 로딩 완료 시점에 실행

    if (subwayArrivals.loading) return <div className="p-8 flex flex-col items-center justify-center animate-pulse"><div className="w-12 h-12 bg-gray-200 rounded-full mb-4" /><p className="text-gray-400 font-bold text-sm">시간표 데이터를 불러오는 중...</p></div>;

    if (subwayArrivals.error) return (
      <div className="p-8 bg-red-50 rounded-3xl border border-red-100 flex flex-col items-center text-center gap-3 animate-fade-in">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500"><Info size={24} /></div>
        <p className="text-red-800 font-black text-sm">{subwayArrivals.error}</p>
        <p className="text-red-500 text-[12px] font-medium leading-relaxed">{subwayArrivals.message || "API 인증키 문제이거나 일시적인 통신 장애일 수 있습니다."}</p>
        <button onClick={() => onTimetableTabChange(currentDayType)} className="mt-2 px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-bold text-[13px] hover:bg-red-100 transition-colors">다시 시도</button>
      </div>
    );

    const dayNames = { "1": "평일", "2": "토요일", "3": "공휴일" };
    const currentDayType = subwayArrivals.dayType || "1";
    const hours = Array.from({ length: 20 }, (_, i) => i + 5); 
    
    // ... (formatArrivalTime, TimetableRow 생략 - 내부 함수 유지를 위해 전체를 바꿈)
    const formatArrivalTime = (t) => {
      const arrTime = t.LEFTTIME || t.ARRIVETIME || "";
      if (!arrTime) return "";
      const parts = arrTime.split(":");
      return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : arrTime;
    };

    const TimetableRow = ({ h }) => {
      const hStr = h.toString().padStart(2, '0');
      const getHourOfTime = (t) => (t.LEFTTIME || t.ARRIVETIME || "").startsWith(hStr);
      const ups = subwayArrivals.up?.filter(getHourOfTime) || [];
      const downs = subwayArrivals.down?.filter(getHourOfTime) || [];
      if (ups.length === 0 && downs.length === 0) return null;
      return (
        <div id={`hour-${h}`} className="flex border-b border-gray-50 group hover:bg-gray-50/50 transition-colors">
          <div className="flex-1 p-3 border-r border-gray-100 space-y-2">
            {ups.map((t, i) => (
              <div key={i} className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-black text-blue-600">{formatArrivalTime(t)}</span>
                  {t.TRAIN_NO && <span className="text-[9px] font-bold text-blue-300 bg-blue-50 px-1 rounded">{t.TRAIN_NO}</span>}
                </div>
                <span className="text-[10px] font-bold text-gray-400 truncate">{(t.DESTSTATION_NM || t.TRAIN_DESTINATION_STATION_NM)}행</span>
              </div>
            ))}
          </div>
          <div className="flex-1 p-3 space-y-2 text-right">
            {downs.map((t, i) => (
              <div key={i} className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 justify-end">
                  {t.TRAIN_NO && <span className="text-[9px] font-bold text-gray-300 bg-gray-50 px-1 rounded">{t.TRAIN_NO}</span>}
                  <span className="text-[13px] font-black text-gray-900">{formatArrivalTime(t)}</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 truncate">{(t.DESTSTATION_NM || t.TRAIN_DESTINATION_STATION_NM)}행</span>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="category-subway animate-fade-in space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#3D53B3] text-white text-[11px] font-black px-2 py-0.5 rounded shadow-sm">1호선</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-black text-gray-900 leading-tight">서울역 <span className="text-gray-400 text-[14px]">시간표</span></h2>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full border bg-green-50 text-green-600 border-green-200">
                  ● LIVE
                </span>
              </div>
              <span className="text-[9px] font-bold text-gray-400">공식 API 실시간 데이터 연동 중</span>
            </div>
          </div>
          <button 
            onClick={() => onTimetableTabChange(currentDayType, true)} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
            title="새로고침"
          >
            <RefreshCw size={18} className={subwayArrivals.loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
          {Object.entries(dayNames).map(([val, name]) => (
            <button key={val} onClick={() => onTimetableTabChange(val)} className={`flex-1 py-2.5 text-[13px] font-black rounded-[14px] transition-all ${currentDayType === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>{name}</button>
          ))}
        </div>

        <div ref={hourScrollRef} className="flex gap-2.5 overflow-x-auto pt-2 pb-4 no-scrollbar border-b border-gray-100 px-1 scroll-smooth">
          {hours.map(h => (
            <button 
              id={`btn-hour-${h}`}
              key={h}
              onClick={() => {
                setSelectedHour(h);
                document.getElementById(`hour-${h}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-[20px] font-black text-[14px] transition-all ${selectedHour === h ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
            >
              {h}
            </button>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] font-black text-gray-500 px-4 py-2 bg-gray-50/80 rounded-xl mb-2">
            <span>상행 (소요산)</span>
            <span>하행 (인천/천안)</span>
          </div>
          <div className="space-y-0 pb-10">
            {hours.map(h => <TimetableRow key={h} h={h} />)}
          </div>
        </div>
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // [CATEGORY 3: STARBUCKS]
  // --------------------------------------------------------------------------
  const StarbucksSection = () => {
    if (!starbucks) return null;
    return (
      <div className="space-y-6 category-starbucks animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#00704a] rounded-2xl flex items-center justify-center text-white shadow-lg"><Coffee size={24} strokeWidth={2.5} /></div>
          <div><h2 className="text-[20px] font-black text-gray-900 leading-tight">{starbucks.name}</h2><p className="text-[12px] font-bold text-[#00704a]">리저브 매장</p></div>
        </div>
        <div className="p-5 bg-green-50/50 border border-green-100 rounded-[24px] space-y-4">
          <div className="flex items-start gap-3"><MapPin size={18} className="text-green-700 mt-0.5" /><p className="text-gray-700 font-medium text-[14px] leading-relaxed">{starbucks.address}</p></div>
          <button className="w-full py-4 bg-white border border-green-100 rounded-2xl text-green-700 font-black text-[14px] flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all">길찾기 <ChevronRight size={16} strokeWidth={3} /></button>
        </div>
      </div>
    );
  };

  // [메인 레이아웃 렌더링]
  return (
    <AnimatePresence>
      {(memo || subwayArrivals || starbucks) && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] md:hidden bg-transparent" onClick={onClose} />
          <motion.div style={{ height: isMobile ? sheetHeight : '100vh' }} initial={isMobile ? { height: 0 } : { x: -400, opacity: 0 }} animate={isMobile ? {} : { x: 0, opacity: 1 }} exit={isMobile ? { height: 0 } : { x: -400, opacity: 0 }} transition={{ type: 'spring', damping: 30, stiffness: 400 }} className="fixed z-[10000] bg-white shadow-2xl flex flex-col md:left-0 md:top-0 md:h-screen md:w-[380px] bottom-0 left-0 w-full rounded-t-[32px] md:rounded-none overflow-hidden">
            {/* Grab Handle & PC Logo */}
            <motion.div className={`flex-shrink-0 touch-none select-none relative z-30 bg-white ${isMobile ? 'cursor-grab' : ''}`} onPan={isMobile ? handlePan : undefined} onPanEnd={isMobile ? handlePanEnd : undefined}>
              <div className="px-6 pt-5 pb-4">{isMobile && <div className="w-full flex justify-center pb-6"><div className="w-14 h-1.5 bg-gray-200 rounded-full" /></div>}{!isMobile && <div className="flex items-center justify-between mb-2"><span className="logo-font text-[20px] font-black text-[#FF4D00]">BABBLE</span><button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all group"><X size={20} className="text-gray-400 group-hover:text-gray-600" /></button></div>}</div>
            </motion.div>
            
            {/* Content Slot */}
            <div ref={contentRef} className="flex-1 overflow-y-auto px-6 pb-20 custom-scrollbar scroll-smooth">
              <MemoSection />
              <SubwaySection />
              <StarbucksSection />
              <div className="h-24" />
            </div>
            
            {/* Input Overlay (Only for Babble) */}
            {memo && (
              <div className="px-6 py-5 bg-white border-t border-gray-100 flex-shrink-0 z-40 bg-white/80 backdrop-blur-md">
                <div className="relative flex items-center">
                  <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="말하고싶은 바블을 남겨주세요" className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-200 rounded-[22px] text-[13px] font-bold focus:outline-none focus:ring-4 focus:ring-[#FF4D00]/10 focus:bg-white transition-all shadow-inner" onKeyPress={(e) => e.key === 'Enter' && onReplySubmit(memo.id)} />
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
