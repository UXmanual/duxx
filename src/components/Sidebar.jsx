import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls, useMotionValue, animate } from 'framer-motion';
import { X, Clock, MessageSquare, Trash2, Send } from 'lucide-react';

/**
 * [Component] LNB 사이드바 / 모바일 바텀시트
 * @version 31.6
 * @description 인터랙티브 높이 조절(onPan) 방식 적용으로 '손가락 밀착' 스와이프 구현 및 상단 점프 현상 해결
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
  formatDateTime 
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  
  // 리얼타임 높이 제어를 위한 MotionValue
  const sheetH = useMotionValue(0);
  const isDragging = useRef(false);

  // 화면 크기 변화 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    
    // 모바일 리셋 및 바디 잠금
    if (memo && isMobile) {
      // 초기 오픈 시 40%로 애니메이션
      animate(sheetH, window.innerHeight * 0.4, { type: 'spring', damping: 35, stiffness: 450 });
      
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
    };
  }, [memo, isMobile]);

  // 최신 답글 정렬
  const sortedReplies = [...replies].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // 소멸 카운트다운
  useEffect(() => {
    if (!memo?.popped_at) {
      setTimeLeft('');
      return;
    }
    const updateTimer = () => {
      const poppedTime = new Date(memo.popped_at);
      const now = new Date();
      const diffMs = now - poppedTime;
      const remainingMs = (30 * 60 * 1000) - diffMs;
      if (remainingMs <= 0) {
        setTimeLeft('00:00');
        return;
      }
      const minutes = Math.floor(remainingMs / (1000 * 60));
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [memo?.popped_at]);

  // 인터랙티브 스와이프 제어 (Hand-follow logic)
  const onPan = (e, info) => {
    if (!isMobile) return;
    isDragging.current = true;
    
    // 현재 높이에서 델타만큼 반대로 계산 (위로 밀면 y 델타가 음수이므로 높이는 증가)
    let newHeight = sheetH.get() - info.delta.y;
    
    // 90% 상단 한계점 고정 (팅김 방지)
    if (newHeight > windowHeight * 0.9) {
      newHeight = windowHeight * 0.9;
    }
    
    sheetH.set(newHeight);
  };

  const onPanEnd = (e, info) => {
    if (!isMobile) return;
    isDragging.current = false;
    
    const currentH = sheetH.get();
    const velocity = info.velocity.y;
    
    // 스냅 로직 (Velocity 및 위치 기준)
    const fastTransition = { type: 'spring', damping: 40, stiffness: 500 };

    if (currentH > windowHeight * 0.65 || (currentH > windowHeight * 0.4 && velocity < -500)) {
      // 90%로 스냅
      animate(sheetH, windowHeight * 0.9, fastTransition);
    } else if (currentH < windowHeight * 0.25 || velocity > 500) {
      // 닫기
      animate(sheetH, 0, fastTransition).then(() => onClose());
    } else {
      // 40%로 복귀
      animate(sheetH, windowHeight * 0.4, fastTransition);
    }
  };

  return (
    <AnimatePresence>
      {memo && (
        <>
          {/* Background Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-transparent z-[9999] md:hidden"
            onClick={onClose}
          />
          
          <motion.div 
            // 데스크탑은 기존 방식, 모바일은 리얼타임 높이 제어
            style={isMobile ? { height: sheetH } : {}}
            variants={!isMobile ? {
              open: { x: 0, opacity: 1 },
              closed: { x: -400, opacity: 0 }
            } : {}}
            initial={isMobile ? false : "closed"}
            animate={!isMobile ? "open" : {}}
            exit={isMobile ? { height: 0 } : "closed"}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}

            className={`
              fixed z-[10000] bg-white shadow-2xl flex flex-col
              md:left-0 md:top-0 md:h-screen md:w-[380px]
              bottom-0 left-0 w-full rounded-t-[32px] md:rounded-none
              overflow-hidden
            `}
          >
            {/* Mobile Drag Area (Handle + Content Card) */}
            <div 
              className="flex-shrink-0 touch-none select-none"
              onPan={onPan}
              onPanEnd={onPanEnd}
            >
              {isMobile && (
                <div className="w-full flex justify-center pt-5 pb-2 cursor-grab active:cursor-grabbing">
                  <div className="w-14 h-1.5 bg-gray-200 rounded-full" />
                </div>
              )}
              
              {/* Desktop Header or Mobile Top Card (Both Draggable in Mobile) */}
              {!isMobile ? (
                <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-6 py-5 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center">
                    <span className="logo-font text-[20px] tracking-[0] uppercase text-[#FF4D00] select-none">BABBLE</span>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all">
                    <X size={20} className="text-gray-400" />
                  </motion.button>
                </div>
              ) : (
                <div className="px-6 py-4 space-y-4 cursor-grab active:cursor-grabbing">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-[#FF4D00] to-[#FF8A00] rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-[#FF4D00]/20">
                        {memo.nickname?.charAt(0) || 'B'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{memo.nickname}</p>
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
                          {formatDateTime(memo.created_at)}
                        </span>
                      </div>
                    </div>
                    {!memo.popped_at && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onPop(memo.id); }}
                        className="p-2.5 bg-white border border-gray-100 shadow-sm hover:border-[#FF4D00]/30 rounded-xl transition-all"
                      >
                        <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4D00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41" />
                        </motion.svg>
                      </button>
                    )}
                  </div>
                  <div className="relative p-5 bg-gray-50 rounded-[24px] border border-gray-100">
                    <p className="text-gray-800 text-sm leading-relaxed font-medium whitespace-pre-wrap">{memo.text}</p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold px-1">
                    <span className={`flex items-center gap-1.5 ${memo.popped_at ? 'text-[#FF4D00]' : 'text-blue-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${memo.popped_at ? 'bg-[#FF4D00]' : 'bg-blue-500'}`} />
                      {memo.popped_at ? `${timeLeft} 후 소멸` : '활성화 상태'}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <MessageSquare size={12} strokeWidth={2.5} /> 답글 {replies.length}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Replies Section */}
            <div 
              className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-2 pb-6"
              onPointerDown={(e) => e.stopPropagation()} 
            >
              {!isMobile && (
                <div className="mb-8 space-y-6">
                  {/* Desktop용 중복 카드 부분 생략 (Main.jsx 구조 유지) */}
                  <div className="relative p-6 bg-gray-50 rounded-[24px] border border-gray-100">
                    <p className="text-gray-800 text-[15px] leading-relaxed font-medium whitespace-pre-wrap">{memo.text}</p>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-gray-900 text-sm">답글 <span className="text-[#FF4D00] ml-1">{replies.length}</span></h3>
                  <div className="h-px bg-gray-100 flex-1 ml-4" />
                </div>
                
                <div className="space-y-4">
                  {sortedReplies.map((reply, idx) => (
                    <div key={reply.id} className="flex gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${reply.is_ai ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-700'}`}>
                        {reply.nickname?.charAt(0)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-gray-800">{reply.nickname}</span>
                          <span className="text-[9px] text-gray-400">{formatDateTime(reply.created_at)}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-normal bg-white border border-gray-100 p-3 rounded-tr-xl rounded-b-xl shadow-sm">
                          {reply.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  {sortedReplies.length === 0 && (
                    <div className="text-center py-10 opacity-40">
                      <MessageSquare size={24} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-[10px] font-bold">첫 번째 답글을 남겨보세요!</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="h-20" />
            </div>

            {/* Fixed Reply Input Box */}
            <div className="px-6 py-5 bg-white border-t border-gray-50 flex-shrink-0 safe-bottom">
              <div className="relative flex items-center">
                <input 
                  type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                  placeholder="말하고싶은 바블을 남겨주세요"
                  className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-100 rounded-[20px] text-[13px] font-bold focus:outline-none focus:ring-4 focus:ring-[#FF4D00]/10 focus:bg-white transition-all shadow-sm"
                  onKeyPress={(e) => e.key === 'Enter' && onReplySubmit(memo.id)}
                />
                <button 
                  onClick={() => onReplySubmit(memo.id)}
                  className="absolute right-1.5 w-11 h-11 bg-[#FF4D00] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF4D00]/30 active:scale-95 transition-transform"
                >
                  <Send size={18} strokeWidth={2.5} />
                </button>
              </div>
              <div style={{ height: 'env(safe-area-inset-bottom, 16px)' }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
