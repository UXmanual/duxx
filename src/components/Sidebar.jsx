import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MessageSquare, Trash2, Send } from 'lucide-react';

/**
 * [Component] LNB 사이드바 / 모바일 바텀시트 (Framer Motion 적용 버전)
 * @version 1.1
 * @description 바블의 상세 정보(작성자, 내용, 답글, 시간, 터트리기)를 표시합니다.
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
  return (
    <AnimatePresence>
      {memo && (
        <>
          {/* Background Overlay for Mobile */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] md:hidden"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed z-[10000] bg-white shadow-2xl overflow-hidden flex flex-col
              md:left-0 md:top-0 md:h-screen md:w-[380px]
              bottom-0 left-0 w-full rounded-t-[32px] md:rounded-none
              max-h-[85vh] md:max-h-none
            `}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-6 py-5 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
              <div className="flex flex-col">
                <h2 className="text-lg font-black text-gray-900 leading-tight">상세 정보</h2>
                <p className="text-[11px] text-[#FF4D00] font-bold uppercase tracking-wider">Bubble Details</p>
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

            <div className="flex-1 overflow-y-auto custom-scrollbar">
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
                          <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium italic">
                            {formatDateTime(memo.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {!memo.popped_at && (
                      <motion.button 
                        whileHover={{ scale: 1.1, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onPop(memo.id)}
                        className="p-3 bg-white border border-gray-100 shadow-sm hover:border-[#FF4D00]/30 hover:bg-[#FF4D00]/5 rounded-2xl transition-all"
                        title="터트리기"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4D00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41" />
                        </svg>
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
                        {memo.popped_at ? '터진 바블 (30분 후 소멸)' : '활성화 상태'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare size={12} strokeWidth={2.5} /> 답글 {replies.length}
                      </span>
                    </div>
                    <button 
                      onClick={() => onDelete(memo.id)}
                      className="text-gray-300 hover:text-red-500 flex items-center gap-1 transition-all"
                    >
                      <Trash2 size={12} /> 삭제
                    </button>
                  </div>
                </div>

                {/* Replies Section */}
                <div className="space-y-5 pb-24">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-gray-900 text-sm">REPLIES <span className="text-[#FF4D00] ml-1">{replies.length}</span></h3>
                    <div className="h-px bg-gray-100 flex-1 ml-4" />
                  </div>
                  
                  <div className="space-y-5">
                    {replies.length === 0 ? (
                      <div className="text-center py-12 px-6 border-2 border-dashed border-gray-100 rounded-[24px]">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <MessageSquare size={20} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 text-xs font-bold">첫 번째 답글의 주인공이 되어보세요!</p>
                      </div>
                    ) : (
                      replies.map((reply, idx) => (
                        <motion.div 
                          key={reply.id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="group/reply"
                        >
                          <div className="flex gap-3">
                            <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${reply.is_ai ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                              {reply.is_ai ? 'AI' : reply.nickname?.charAt(0)}
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-gray-800">{reply.nickname}</span>
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
              </div>
            </div>

            {/* Reply Input Box */}
            <div className="p-6 bg-white/80 backdrop-blur-lg border-t border-gray-100 flex-shrink-0">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="따뜻한 한마디를 남겨주세요..."
                  className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-100 rounded-[20px] text-[13px] font-bold focus:outline-none focus:ring-4 focus:ring-[#FF4D00]/10 focus:bg-white focus:border-[#FF4D00]/30 transition-all placeholder:text-gray-300"
                  onKeyPress={(e) => e.key === 'Enter' && onReplySubmit(memo.id)}
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onReplySubmit(memo.id)}
                  disabled={!replyText.trim()}
                  className="absolute right-2 w-11 h-11 bg-[#FF4D00] text-white rounded-2xl flex items-center justify-center disabled:opacity-30 shadow-lg shadow-[#FF4D00]/30"
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
