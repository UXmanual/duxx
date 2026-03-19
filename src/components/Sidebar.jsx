import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { X, Clock, MessageSquare, Trash2, Send } from 'lucide-react';

/**
 * [Component] LNB 사이드바 / 모바일 바텀시트
 * @version 42.9
 * @description 터트리기 버튼 스타일 수정 및 터트리기 애니메이션 고도화 (v33.6)
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
  const sheetHeight = useMotionValue(0);

  // 화면 크기 변화 감지
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
    if (!memo) return;

    if (isMobile) {
      // PC -> 모바일 전환 시 (항상 초기 높이 45%로)
      animate(sheetHeight, window.innerHeight * 0.45, { 
        type: 'spring', 
        damping: 30, 
        stiffness: 400 
      });
      
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // 모바일 -> PC 전환 시 (100% 높이)
      sheetHeight.set(window.innerHeight);
      
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
    }
  }, [isMobile, memo]);

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

  // 인터랙티브 드래그 핸들러
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

  // URL 링크 감지 및 변환 함수 (v38.2)
  const renderTextWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((chunk, i) => {
      if (chunk.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={chunk} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#FF4D00] hover:underline underline-offset-4 break-all decoration-2 font-bold"
            onClick={(e) => e.stopPropagation()}
          >
            {chunk}
          </a>
        );
      }
      return chunk;
    });
  };

  // 공통 바블 본문 카드 컴포넌트
  const MemoContentCard = ({ isCompact = false }) => (
    <div className={`space-y-4 ${isCompact ? '' : 'mb-8'}`}>
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
            onClick={(e) => { e.stopPropagation(); onPop(memo.id, e); }}
            className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all group"
          >
            <motion.svg 
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4D00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              animate={{ scale: [1, 0.85, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41" />
            </motion.svg>
          </button>
        )}
      </div>
      <div className={`relative p-5 bg-gray-50 rounded-[24px] border border-gray-100 ${isMobile ? 'max-h-[160px]' : ''} overflow-hidden`}>
        <p className="text-gray-800 text-sm leading-relaxed font-medium whitespace-pre-wrap">
          {renderTextWithLinks(memo.text)}
        </p>
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
  );

  return (
    <AnimatePresence>
      {memo && (
        <>
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
            className={`
              fixed z-[10000] bg-white shadow-2xl flex flex-col
              md:left-0 md:top-0 md:h-screen md:w-[380px]
              bottom-0 left-0 w-full rounded-t-[32px] md:rounded-none
              overflow-hidden
            `}
          >
            {/* [Header Area] */}
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
                  {memo && <MemoContentCard isCompact={true} />}
                </div>
              ) : (
                <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center">
                    <span className="logo-font text-[20px] tracking-[0] uppercase text-[#FF4D00] select-none">BABBLE</span>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all">
                    <X size={20} className="text-gray-400" />
                  </motion.button>
                </div>
              )}
            </motion.div>

            {/* [Scrollable Area] */}
            <div 
              className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-4 pb-6"
              onPointerDown={(e) => e.stopPropagation()} 
            >
              {!isMobile && (
                <div className="pt-2">
                  {memo && <MemoContentCard />}
                </div>
              )}

              {memo && (
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
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-black text-gray-800">{reply.nickname}</span>
                              {reply.is_ai && (
                                <span className="text-[9px] bg-indigo-50 text-indigo-500 px-1 rounded-sm font-bold border border-indigo-100/50">A</span>
                              )}
                            </div>
                            <span className="text-[9px] text-gray-400">{formatDateTime(reply.created_at)}</span>
                          </div>
                          <p className="text-xs text-gray-600 leading-normal bg-white border border-gray-100 p-3 rounded-tr-xl rounded-b-xl">
                            {renderTextWithLinks(reply.text)}
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
              )}
              <div className="h-32" />
            </div>

            {/* [Bottom Fixed Area] */}
            {memo && (
              <div className={`
                ${isMobile ? 'absolute bottom-0 left-0 w-full' : 'relative'}
                px-6 py-5 bg-white border-t border-gray-100 flex-shrink-0 z-40
              `}>
                <div className="relative flex items-center">
                  <input 
                    type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                    placeholder="말하고싶은 바블을 남겨주세요"
                    className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-200 rounded-[22px] text-[13px] font-bold focus:outline-none focus:ring-4 focus:ring-[#FF4D00]/10 focus:bg-white transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && onReplySubmit(memo.id)}
                  />
                  <button 
                    onClick={() => onReplySubmit(memo.id)}
                    className="absolute right-1.5 w-11 h-11 bg-[#FF4D00] text-white rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Send size={18} strokeWidth={2.5} />
                  </button>
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
