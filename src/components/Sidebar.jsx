import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Clock, MessageSquare, Trash2, Send } from 'lucide-react';

/**
 * [Component] LNB 사이드바 / 모바일 바텀시트
 * @version 31.0
 * @description 40%/90% 가변형 바텀시트 고도화 및 하단 인풋 고정 수정
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
  const [sheetHeight, setSheetHeight] = useState('half'); // 'half', 'full'
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const dragControls = useDragControls();

  // 화면 크기 변화 감지 및 바디 스크롤 잠금
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    
    if (memo && isMobile) {
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

  // 최신 답글이 위로 오도록 정렬
  const sortedReplies = [...replies].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // 실시간 소멸 카운트다운 로직
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

  return (
    <AnimatePresence>
      {memo && (
        <>
          {/* Background Overlay - Mobile Only */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-transparent z-[9999] md:hidden"
            onClick={onClose}
          />
          
          <motion.div 
            variants={{
              half: { y: windowHeight * 0.6 }, // 40% 노출
              full: { y: windowHeight * 0.1 }, // 90% 노출
              closed: { y: windowHeight }
            }}
            initial={isMobile ? "closed" : { x: -400, opacity: 0 }}
            animate={isMobile ? sheetHeight : { x: 0, opacity: 1, y: 0 }}
            exit={isMobile ? "closed" : { x: -400, opacity: 0 }}
            // 인스턴트한 느낌을 위해 물리엔진 값 조정 (반응 속도 상향)
            transition={{ type: 'spring', damping: 25, stiffness: 350, restDelta: 0.5 }}
            drag={isMobile ? "y" : false}
            dragControls={dragControls}
            dragListener={false} 
            dragConstraints={{ top: windowHeight * 0.1, bottom: windowHeight }}
            dragElastic={0.02}
            onDragEnd={(e, info) => {
              const offset = info.offset.y;
              const velocity = info.velocity.y;

              if (sheetHeight === 'half') {
                if (offset < -50 || velocity < -300) {
                  setSheetHeight('full');
                } else if (offset > 80 || velocity > 300) {
                  onClose();
                }
              } else if (sheetHeight === 'full') {
                if (offset > 100 || velocity > 300) {
                  setSheetHeight('half');
                }
              }
            }}
            className={`
              fixed z-[10000] bg-white shadow-2xl flex flex-col
              md:left-0 md:top-0 md:h-screen md:w-[380px]
              bottom-0 left-0 w-full rounded-t-[32px] md:rounded-none
              h-screen md:h-full overflow-hidden
            `}
          >
            {/* Mobile Drag Handle Area */}
            {isMobile && (
              <div 
                className="w-full flex justify-center pt-5 pb-5 flex-shrink-0 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-14 h-1.5 bg-gray-200 rounded-full" />
              </div>
            )}
            
            {/* Desktop Only Header */}
            {!isMobile && (
              <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-6 py-5 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center">
                  <span className="logo-font text-[20px] tracking-[0] uppercase text-[#FF4D00] select-none">
                    BABBLE
                  </span>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose} 
                  className="p-2.5 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X size={20} className="text-gray-400" />
                </motion.button>
              </div>
            )}

            {/* Content Area - Scrollable */}
            <div 
              className="flex-1 overflow-y-auto custom-scrollbar"
              onPointerDown={(e) => e.stopPropagation()} 
            >
              <div className="p-6 space-y-8">
                {/* Main Content Card */}
                <div className="space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: -3, scale: 1 }}
                        className="w-12 h-12 bg-gradient-to-br from-[#FF4D00] to-[#FF8A00] rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-[#FF4D00]/20"
                      >
                        {memo.nickname?.charAt(0) || 'B'}
                      </motion.div>
                      <div>
                        <p className="font-bold text-gray-900 text-base">{memo.nickname}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
                            {formatDateTime(memo.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {!memo.popped_at && (
                      <motion.button 
                        whileHover={{ 
                          scale: [1, 0.85, 1.15, 1],
                          transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
                        }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => onPop(memo.id)}
                        className="p-3 bg-white border border-gray-100 shadow-sm hover:border-[#FF4D00]/30 hover:bg-[#FF4D00]/5 rounded-2xl transition-all overflow-hidden"
                        title="터트리기"
                      >
                        <motion.svg 
                          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4D00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        >
                          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41" />
                        </motion.svg>
                      </motion.button>
                    )}
                  </div>

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative p-6 bg-gray-50 rounded-[24px] border border-gray-100 overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF4D00]/5 rounded-full -mr-12 -mt-12" />
                    <p className="text-gray-800 text-[15px] leading-relaxed relative z-10 font-medium whitespace-pre-wrap">
                      {memo.text}
                    </p>
                  </motion.div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 px-1">
                    <div className="flex items-center gap-4">
                      <span className={`flex items-center gap-1.5 ${memo.popped_at ? 'text-[#FF4D00]' : 'text-blue-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${memo.popped_at ? 'bg-[#FF4D00]' : 'bg-blue-500'}`} />
                        {memo.popped_at ? `${timeLeft} 후 소멸` : '활성화 상태'}
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <MessageSquare size={12} strokeWidth={2.5} /> 답글 {replies.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Replies Section */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-gray-900 text-sm">답글 <span className="text-[#FF4D00] ml-1">{replies.length}</span></h3>
                    <div className="h-px bg-gray-100 flex-1 ml-4" />
                  </div>
                  
                  <div className="space-y-5">
                    {sortedReplies.length === 0 ? (
                      <div className="text-center py-12 px-6 border-2 border-dashed border-gray-100 rounded-[24px]">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <MessageSquare size={20} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 text-xs font-bold">첫 번째 답글의 주인공이 되어보세요!</p>
                      </div>
                    ) : (
                      sortedReplies.map((reply, idx) => (
                        <motion.div 
                          key={reply.id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="group/reply"
                        >
                          <div className="flex gap-3">
                            <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${reply.is_ai ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-gray-100 text-gray-700'}`}>
                              {reply.nickname?.charAt(0)}
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-gray-800">{reply.nickname}</span>
                                  {reply.is_ai && (
                                    <span className="text-[9px] bg-indigo-50 text-indigo-500 px-1 rounded-sm font-bold border border-indigo-100/50">A</span>
                                  )}
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium tracking-tight bg-gray-50 px-2 py-0.5 rounded-full">{formatDateTime(reply.created_at)}</span>
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed bg-white border border-gray-100 p-4 rounded-tr-2xl rounded-b-2xl shadow-sm group-hover/reply:border-[#FF4D00]/20 transition-all">
                                {reply.text}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
                {/* 인풋 영역이 덮지 않도록 하단 여백 추가 (v31.0) */}
                <div className="h-[120px] md:h-0" />
              </div>
            </div>

            {/* Reply Input Box - Fixed Bottom */}
            <div className="p-6 pb-12 md:pb-6 bg-white border-t border-gray-100 flex-shrink-0 sticky bottom-0 left-0 w-full z-20">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="말하고싶은 바블을 남겨주세요"
                  className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-100 rounded-[20px] text-[13px] font-bold focus:outline-none focus:ring-4 focus:ring-[#FF4D00]/10 focus:bg-white focus:border-[#FF4D00]/30 transition-all placeholder:text-gray-300 shadow-sm"
                  onKeyPress={(e) => e.key === 'Enter' && onReplySubmit(memo.id)}
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onReplySubmit(memo.id)}
                  className="absolute right-1.5 w-11 h-11 bg-[#FF4D00] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF4D00]/30"
                >
                  <Send size={18} strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
