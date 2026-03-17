import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { X, Clock, MessageSquare, Trash2, Send } from 'lucide-react';

/**
 * [Component] LNB 사이드바 / 모바일 바텀시트
 * @version 31.7
 * @description 인터랙티브 높이 스와이프 및 드래그 가시성 오류 수정 버전
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
  
  // 리얼타임 높이 제어를 위한 MotionValue (초기값 0)
  const sheetHeight = useMotionValue(0);

  // 화면 크기 변화 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    
    // 바텀시트 열릴 때 초기 높이 설정 (40%)
    if (memo && isMobile) {
      animate(sheetHeight, window.innerHeight * 0.4, { 
        type: 'spring', 
        damping: 35, 
        stiffness: 400 
      });
      
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

  // 실시간 소멸 카운트다운
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

  // 드래그(Pan) 핸들러 - 사용자의 손가락 움직임에 따라 높이 조절
  const handlePan = (e, info) => {
    if (!isMobile) return;
    
    // Y축 이동량의 반대 방향으로 높이 조절 (위로 올리면 높이 증가)
    let newH = sheetHeight.get() - info.delta.y;
    
    // 최대 높이 제한 (90%)
    const maxH = windowHeight * 0.9;
    if (newH > maxH) newH = maxH;
    
    sheetHeight.set(newH);
  };

  // 드래그 종료 시 스냅 로직
  const handlePanEnd = (e, info) => {
    if (!isMobile) return;
    
    const currentH = sheetHeight.get();
    const velocity = info.velocity.y; // Y축 속도 (양수면 아래쪽)

    const snapTransition = { type: 'spring', damping: 35, stiffness: 450 };

    // 1. 위로 빠르게 쓸어올리거나 임계값 넘으면 90%로
    if (velocity < -500 || currentH > windowHeight * 0.65) {
      animate(sheetHeight, windowHeight * 0.9, snapTransition);
    } 
    // 2. 아래로 빠르게 내리거나 너무 낮아지면 닫기
    else if (velocity > 500 || currentH < windowHeight * 0.2) {
      animate(sheetHeight, 0, snapTransition).then(() => onClose());
    } 
    // 3. 그 외에는 40%로 복귀
    else {
      animate(sheetHeight, windowHeight * 0.4, snapTransition);
    }
  };

  return (
    <AnimatePresence>
      {memo && (
        <>
          {/* 모바일 배경 오버레이 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-[9999] md:hidden"
            onClick={onClose}
          />
          
          <motion.div 
            // 모바일에서는 실시간 높이 제어, 데스크탑은 좌측 슬라이드
            style={isMobile ? { height: sheetHeight } : {}}
            variants={!isMobile ? {
              open: { x: 0, opacity: 1 },
              closed: { x: -400, opacity: 0 }
            } : {}}
            initial={isMobile ? { height: 0 } : "closed"}
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
            {/* 드래그 가능 영역 (핸들 + 상단 카드) */}
            <motion.div 
              className="flex-shrink-0 touch-none select-none cursor-grab active:cursor-grabbing bg-white relative z-10"
              onPan={handlePan}
              onPanEnd={handlePanEnd}
            >
              {isMobile && (
                <div className="w-full flex justify-center pt-5 pb-2">
                  <div className="w-14 h-1.5 bg-gray-200 rounded-full" />
                </div>
              )}
              
              {!isMobile ? (
                // 데스크탑 헤더
                <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center">
                    <span className="logo-font text-[20px] tracking-[0] uppercase text-[#FF4D00] select-none">BABBLE</span>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all">
                    <X size={20} className="text-gray-400" />
                  </motion.button>
                </div>
              ) : (
                // 모바일 상단 조작 카드
                <div className="px-6 py-4 space-y-4">
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
                        className="p-2.5 bg-white border border-gray-100 shadow-sm rounded-xl"
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
                  <div className="flex items-center gap-4 text-[10px] font-bold px-1 pb-1">
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
            </motion.div>

            {/* 댓글 스크롤 영역 */}
            <div 
              className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-2 pb-6"
              onPointerDown={(e) => e.stopPropagation()} 
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-gray-900 text-sm">답글 <span className="text-[#FF4D00] ml-1">{replies.length}</span></h3>
                  <div className="h-px bg-gray-100 flex-1 ml-4" />
                </div>
                
                <div className="space-y-4">
                  {sortedReplies.map((reply) => (
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

            {/* 하단 고정 답글 입력창 */}
            <div className="px-6 py-5 bg-white border-t border-gray-100 flex-shrink-0 z-20">
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
