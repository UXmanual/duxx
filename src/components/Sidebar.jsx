import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { X, MessageSquare, Send, Coffee, MapPin, ChevronRight, Info, RefreshCw, Copy, Check, Crosshair } from 'lucide-react';

const Sidebar = ({
  memo,
  replies = [],
  onClose,
  onReplySubmit,
  onPop,
  replyText,
  setReplyText,
  formatDateTime,
  subwayArrivals,
  onTimetableTabChange,
  starbucks,
  busStop,
  currentLocationInfo,
  onBusRefresh
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const sheetHeight = useMotionValue(0);
  const contentRef = useRef(null);
  const isTransitOnlyView = (!!subwayArrivals || !!busStop) && !memo && !starbucks && !currentLocationInfo;
  const isSubwayOnlyView = !!subwayArrivals && !busStop && !memo && !starbucks && !currentLocationInfo;
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [memo?.id, subwayArrivals?.dayType, starbucks?.id, busStop?.station?.id, currentLocationInfo?.fetchedAt]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const hasData = !!(memo || subwayArrivals || starbucks || busStop || currentLocationInfo);
    if (!hasData) {
      wasOpenRef.current = false;
      sheetHeight.set(0);
      document.body.style.overflow = 'auto';
      return;
    }

    if (isMobile) {
      if (!wasOpenRef.current) {
        const initialHeight = windowHeight * (isTransitOnlyView ? 0.9 : 0.45);
        animate(sheetHeight, initialHeight, { type: 'spring', damping: 30, stiffness: 400 });
      }
      document.body.style.overflow = 'hidden';
    } else {
      sheetHeight.set(window.innerHeight);
      document.body.style.overflow = 'auto';
    }

    wasOpenRef.current = true;
  }, [isMobile, isTransitOnlyView, !!memo, !!subwayArrivals, !!starbucks, !!busStop, !!currentLocationInfo, sheetHeight, windowHeight]);

  const handlePan = (e, info) => {
    if (!isMobile) return;
    let nextHeight = sheetHeight.get() - info.delta.y;
    if (nextHeight > windowHeight * 0.95) nextHeight = windowHeight * 0.95;
    sheetHeight.set(nextHeight);
  };

  const handlePanEnd = (e, info) => {
    if (!isMobile) return;

    const currentHeight = sheetHeight.get();
    const velocity = info.velocity.y;
    const snapTransition = { type: 'spring', damping: 38, stiffness: 450 };
    const halfHeight = windowHeight * 0.45;
    const fullHeight = windowHeight * 0.9;

    if (currentHeight > windowHeight * 0.65) {
      if (velocity > 400) animate(sheetHeight, halfHeight, snapTransition);
      else animate(sheetHeight, fullHeight, snapTransition);
      return;
    }

    if (currentHeight > windowHeight * 0.2) {
      if (velocity > 400) animate(sheetHeight, 0, snapTransition).then(() => onClose());
      else if (velocity < -400) animate(sheetHeight, fullHeight, snapTransition);
      else animate(sheetHeight, halfHeight, snapTransition);
      return;
    }

    animate(sheetHeight, 0, snapTransition).then(() => onClose());
  };

  const MemoSection = () => {
    if (!memo) return null;

    const sortedReplies = [...replies].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    useEffect(() => {
      if (!memo.popped_at) {
        setTimeLeft('');
        return;
      }

      const update = () => {
        const poppedTime = new Date(memo.popped_at);
        const remainingMs = 30 * 60 * 1000 - (new Date() - poppedTime);
        if (remainingMs <= 0) {
          setTimeLeft('00:00');
          return;
        }

        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
      };

      update();
      const timer = setInterval(update, 1000);
      return () => clearInterval(timer);
    }, [memo.popped_at]);

    const coordsText = `${Number(memo.lat).toFixed(6)}, ${Number(memo.lng).toFixed(6)}`;
    const handleCopyCoords = async () => {
      try {
        await navigator.clipboard.writeText(coordsText);
        setCopiedCoords(true);
        window.setTimeout(() => setCopiedCoords(false), 1500);
      } catch (error) {
        console.error('Failed to copy coordinates:', error);
      }
    };
    return (
      <div className="space-y-6 category-babble animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF4D00] to-[#FF8A00] rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-[#FF4D00]/20">
              {memo.nickname?.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">{memo.nickname}</p>
              <p className="text-[13px] text-gray-400 font-medium">{formatDateTime(memo.created_at)}</p>
            </div>
          </div>
          {!memo.popped_at && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPop(memo.id, e);
              }}
              className="p-2.5 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all active:scale-90"
            >
              <motion.svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FF4D00"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{ scale: [1, 0.85, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41" />
              </motion.svg>
            </button>
          )}
        </div>

        <div className="p-5 bg-gray-50 rounded-[24px] border border-gray-100">
          <p className="text-gray-800 text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{memo.text}</p>
        </div>

        <div className="flex items-center gap-4 text-[13px] font-bold px-1">
          <span className={`flex items-center gap-1.5 ${memo.popped_at ? 'text-[#FF4D00]' : 'text-blue-500'}`}>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${memo.popped_at ? 'bg-[#FF4D00]' : 'bg-blue-500'}`} />
            {memo.popped_at ? `${timeLeft} 남음` : '활성 상태'}
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <MessageSquare size={12} strokeWidth={2.5} /> 댓글 {replies.length}
          </span>
          <button
            type="button"
            onClick={handleCopyCoords}
            className="ml-auto flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors"
            title="좌표 복사"
          >
            {copiedCoords ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} strokeWidth={2.5} />}
            <span>{coordsText}</span>
          </button>
        </div>

        {sortedReplies.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-gray-50">
            <h3 className="text-[14px] font-black text-gray-400 px-1">댓글 {sortedReplies.length}</h3>
            {sortedReplies.map((reply) => (
              <div key={reply.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-[13px] text-gray-900">{reply.nickname}</p>
                  <span className="text-[13px] text-gray-400 font-medium">{formatDateTime(reply.created_at)}</span>
                </div>
                <p className="text-[13px] text-gray-700 leading-relaxed">{reply.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const SubwaySection = () => {
    const initialHour = new Date().getHours();
    const [selectedHour, setSelectedHour] = useState(initialHour);
    const hourScrollRef = useRef(null);
    const listScrollRef = useRef(null);
    const isHourMouseDownRef = useRef(false);
    const isHourDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const dragStartScrollLeftRef = useRef(0);
    const dragDistanceRef = useRef(0);
    const dragVelocityRef = useRef(0);
    const lastPointerXRef = useRef(0);
    const lastPointerTimeRef = useRef(0);
    const momentumFrameRef = useRef(null);
    const hasInitialScrollPositionRef = useRef(false);

    if (!subwayArrivals) return null;

    const currentDayType = subwayArrivals.dayType || '1';
    const dayNames = { '1': '평일', '2': '토요일', '3': '휴일' };
    const hourRows = Array.from({ length: 20 }, (_, i) => i + 5);

    useEffect(() => {
      setSelectedHour(initialHour);
    }, [initialHour, subwayArrivals.dayType]);

    const getStationEventRawTime = (train) => {
      if (train.LEFTTIME && train.LEFTTIME !== '00:00:00') return train.LEFTTIME;
      if (train.ARRIVETIME && train.ARRIVETIME !== '00:00:00') return train.ARRIVETIME;
      return train.LEFTTIME || train.ARRIVETIME || '';
    };

    const formatArrivalTime = (train) => {
      const rawTime = getStationEventRawTime(train);
      if (!rawTime) return '';
      const [hh, mm] = rawTime.split(':');
      return `${hh}:${mm}`;
    };

    const formatDestination = (train) =>
      train.SUBWAYENAME || train.DESTSTATION_NM || train.TRAIN_DESTINATION_STATION_NM || '도착';

    const getMillisecondsUntilTrain = (train) => {
      const rawTime = getStationEventRawTime(train);
      if (!rawTime) return Number.POSITIVE_INFINITY;

      const [hh = '0', mm = '0', ss = '0'] = rawTime.split(':');
      const now = new Date();
      const target = new Date(now);
      target.setHours(Number(hh), Number(mm), Number(ss), 0);

      if (target < now) {
        target.setDate(target.getDate() + 1);
      }

      return target.getTime() - now.getTime();
    };

    const getNextTrain = (trains) =>
      (trains || []).reduce((bestTrain, train) => {
        const diff = getMillisecondsUntilTrain(train);
        if (diff === Number.POSITIVE_INFINITY) return bestTrain;
        if (!bestTrain) return train;
        return diff < getMillisecondsUntilTrain(bestTrain) ? train : bestTrain;
      }, null);

    const scrollToHour = (hour, behavior = 'smooth') => {
      const listContainer = listScrollRef.current;
      const target = document.getElementById(`hour-${hour}`);
      if (!listContainer || !target) return;

      const headerOffset = 56;
      const currentHour = new Date().getHours();
      const containerRect = listContainer.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const hourSectionTop =
        targetRect.top - containerRect.top + listContainer.scrollTop - headerOffset;

      if (hour !== currentHour) {
        listContainer.scrollTo({
          top: Math.max(0, hourSectionTop),
          behavior
        });
        return;
      }

      const nextTrainTarget = target.querySelector('[data-next-train="true"]');
      if (!nextTrainTarget) {
        listContainer.scrollTo({
          top: Math.max(0, hourSectionTop),
          behavior
        });
        return;
      }

      const nextTrainRect = nextTrainTarget.getBoundingClientRect();
      const nextTrainTop =
        nextTrainRect.top - containerRect.top + listContainer.scrollTop - headerOffset;

      listContainer.scrollTo({
        top: Math.max(0, nextTrainTop),
        behavior
      });
    };

    const scrollHourTabToCenter = (hour, behavior = 'smooth') => {
      const container = hourScrollRef.current;
      const button = document.getElementById(`btn-hour-${hour}`);
      if (!container || !button) return;

      const centeredLeft =
        button.offsetLeft - (container.clientWidth - button.clientWidth) / 2;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;

      container.scrollTo({
        behavior,
        left: Math.max(0, Math.min(centeredLeft, maxScrollLeft))
      });
    };

    const handleHourClick = (hour) => {
      if (isHourDraggingRef.current) return;

      setSelectedHour(hour);
      requestAnimationFrame(() => {
        scrollHourTabToCenter(hour, 'smooth');
        scrollToHour(hour, 'smooth');
      });
    };

    useEffect(() => {
      hasInitialScrollPositionRef.current = false;
    }, [subwayArrivals.dayType, subwayArrivals.loading]);

    useLayoutEffect(() => {
      if (subwayArrivals.loading || hasInitialScrollPositionRef.current) return;

      scrollHourTabToCenter(selectedHour, 'auto');
      scrollToHour(selectedHour, 'auto');
      hasInitialScrollPositionRef.current = true;
    }, [selectedHour, subwayArrivals.loading]);

    const handleHourMouseDown = (event) => {
      if (isMobile) return;

      const container = hourScrollRef.current;
      if (!container) return;

      if (momentumFrameRef.current) {
        cancelAnimationFrame(momentumFrameRef.current);
        momentumFrameRef.current = null;
      }

      isHourMouseDownRef.current = true;
      isHourDraggingRef.current = false;
      dragStartXRef.current = event.pageX;
      dragStartScrollLeftRef.current = container.scrollLeft;
      dragDistanceRef.current = 0;
      dragVelocityRef.current = 0;
      lastPointerXRef.current = event.pageX;
      lastPointerTimeRef.current = performance.now();
      container.classList.add('cursor-grabbing');
    };

    const handleHourMouseMove = (event) => {
      if (isMobile || !isHourMouseDownRef.current) return;

      const container = hourScrollRef.current;
      if (!container) return;

      const deltaX = event.pageX - dragStartXRef.current;
      dragDistanceRef.current = Math.abs(deltaX);

      if (!isHourDraggingRef.current && dragDistanceRef.current < 6) {
        return;
      }

      event.preventDefault();
      isHourDraggingRef.current = true;
      container.scrollLeft = dragStartScrollLeftRef.current - deltaX;

      const now = performance.now();
      const elapsed = Math.max(now - lastPointerTimeRef.current, 1);
      dragVelocityRef.current = (lastPointerXRef.current - event.pageX) / elapsed;
      lastPointerXRef.current = event.pageX;
      lastPointerTimeRef.current = now;
    };

    const startHourMomentum = () => {
      const container = hourScrollRef.current;
      if (!container) return;

      let velocity = dragVelocityRef.current * 18;
      if (Math.abs(velocity) < 0.8) return;

      const step = () => {
        velocity *= 0.92;

        if (Math.abs(velocity) < 0.2) {
          momentumFrameRef.current = null;
          return;
        }

        container.scrollLeft += velocity;
        momentumFrameRef.current = requestAnimationFrame(step);
      };

      momentumFrameRef.current = requestAnimationFrame(step);
    };

    const resetHourDrag = () => {
      const container = hourScrollRef.current;
      const shouldStartMomentum = isHourDraggingRef.current && Math.abs(dragVelocityRef.current) > 0.01;

      isHourMouseDownRef.current = false;
      container?.classList.remove('cursor-grabbing');

      if (shouldStartMomentum) {
        startHourMomentum();
      }

      window.setTimeout(() => {
        isHourDraggingRef.current = false;
        dragDistanceRef.current = 0;
        dragVelocityRef.current = 0;
      }, 0);
    };

    useEffect(() => {
      if (isMobile) return undefined;

      const handleMouseUp = () => {
        if (!isHourMouseDownRef.current) return;
        resetHourDrag();
      };

      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }, [isMobile]);

    useEffect(() => () => {
      if (momentumFrameRef.current) {
        cancelAnimationFrame(momentumFrameRef.current);
      }
    }, []);

    const nextUpTrain = getNextTrain(subwayArrivals.up);
    const nextDownTrain = getNextTrain(subwayArrivals.down);

    const TimetableRow = ({ hour }) => {
      const hourPrefix = hour.toString().padStart(2, '0');
      const matchesHour = (train) => getStationEventRawTime(train).startsWith(hourPrefix);
      const ups = subwayArrivals.up?.filter(matchesHour) || [];
      const downs = subwayArrivals.down?.filter(matchesHour) || [];
      const now = new Date();
      const isCurrentHour = now.getHours() === hour;

      const getUpcomingDiff = (train) => {
        const diff = getMillisecondsUntilTrain(train);
        return diff === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : diff;
      };

      const upcomingCandidates = isCurrentHour
        ? [...ups, ...downs]
            .map((train) => ({ train, diff: getUpcomingDiff(train) }))
            .filter(({ diff }) => diff >= 0)
            .sort((a, b) => a.diff - b.diff)
        : [];

      const currentHourAnchorTrain = upcomingCandidates[0]?.train || null;

      if (ups.length === 0 && downs.length === 0) return null;

      return (
        <div id={`hour-${hour}`} className="flex border-b border-gray-50 group hover:bg-gray-50/50 transition-colors">
          <div className="flex-1 p-4 border-r border-gray-100 space-y-3">
            {ups.map((train, index) => (
              <div
                key={`up-${hour}-${index}`}
                className={`flex flex-col rounded-2xl px-3 py-2 ${train === nextUpTrain ? 'bg-blue-50 ring-1 ring-blue-200 shadow-sm' : ''}`}
                data-next-train={train === currentHourAnchorTrain}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-[900] text-blue-600 tracking-tighter">{formatArrivalTime(train)}</span>
                  {train.TRAIN_NO && (
                    <span className="text-[8px] font-bold text-blue-300 border border-blue-100 px-1 rounded-sm">
                      {train.TRAIN_NO}
                    </span>
                  )}
                </div>
                <span className="text-[13px] font-bold text-gray-400">{formatDestination(train)}</span>
              </div>
            ))}
          </div>

          <div className="flex-1 p-4 space-y-3 text-right">
            {downs.map((train, index) => (
              <div
                key={`down-${hour}-${index}`}
                className={`flex flex-col items-end rounded-2xl px-3 py-2 ${train === nextDownTrain ? 'bg-orange-50 ring-1 ring-orange-200 shadow-sm' : ''}`}
                data-next-train={train === currentHourAnchorTrain}
              >
                <div className="flex items-center gap-1.5 justify-end">
                  {train.TRAIN_NO && (
                    <span className="text-[8px] font-bold text-gray-300 border border-gray-100 px-1 rounded-sm">
                      {train.TRAIN_NO}
                    </span>
                  )}
                  <span className="text-[15px] font-[900] text-gray-900 tracking-tighter">{formatArrivalTime(train)}</span>
                </div>
                <span className="text-[13px] font-bold text-gray-400">{formatDestination(train)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    };

    const TimetableSkeletonRow = ({ align = 'left', highlighted = false, withBadge = false }) => (
      <div
        className={`flex flex-col ${align === 'right' ? 'items-end' : ''} rounded-2xl px-3 py-2 ${
          highlighted ? 'bg-blue-50/70 ring-1 ring-blue-100 shadow-sm' : ''
        }`}
      >
        <div className={`flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : ''}`}>
          {withBadge && <div className="h-3.5 w-7 rounded-md bg-gray-200/90 animate-pulse" />}
          <div className="h-5 w-14 rounded-full bg-gray-300 animate-pulse" />
        </div>
        <div className="mt-2 h-3.5 w-16 rounded-full bg-gray-200 animate-pulse" />
      </div>
    );

    const TimetableSkeletonHourBlock = ({ emphasize = false }) => (
      <div className="flex border-b border-gray-50">
        <div className="flex-1 p-4 border-r border-gray-100 space-y-3">
          <TimetableSkeletonRow highlighted={emphasize} withBadge />
          <TimetableSkeletonRow />
        </div>
        <div className="flex-1 p-4 space-y-3">
          <TimetableSkeletonRow align="right" highlighted={emphasize} withBadge />
          <TimetableSkeletonRow align="right" />
        </div>
      </div>
    );

    if (subwayArrivals.loading) {
      return (
        <div className="category-subway animate-fade-in h-full flex flex-col">
          <div className="sticky top-0 z-10 bg-white pb-4 space-y-4">
            <div className="flex justify-between items-start gap-3 px-1">
              <div className="min-w-0 flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#3D53B3]/10 border border-blue-100 flex flex-col items-center justify-center leading-none">
                  <div className="h-2.5 w-6 rounded-full bg-[#3D53B3]/30 animate-pulse" />
                  <div className="mt-1.5 h-2 w-5 rounded-full bg-[#3D53B3]/20 animate-pulse" />
                </div>
                <div className="min-w-0 space-y-2 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="h-6 w-24 rounded-full bg-gray-300 animate-pulse" />
                    <div className="h-5 w-12 rounded-full bg-blue-100 animate-pulse" />
                  </div>
                  <div className="h-3.5 w-32 rounded-full bg-gray-200 animate-pulse" />
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
            </div>

            <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className={`flex-1 rounded-[14px] py-2.5 ${
                    item === 0 ? 'bg-white shadow-sm' : 'bg-transparent'
                  }`}
                >
                  <div className="mx-auto h-4 w-12 rounded-full bg-gray-200 animate-pulse" />
                </div>
              ))}
            </div>

            <div className="flex gap-2.5 overflow-hidden pt-2 pb-4 no-scrollbar border-b border-gray-100 px-1">
              {hourRows.slice(0, isMobile ? 5 : 8).map((hour, index) => (
                <div
                  key={`skeleton-hour-${hour}`}
                  className={`flex-shrink-0 w-12 h-12 rounded-[20px] flex items-center justify-center ${
                    index === 1 ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-gray-50'
                  }`}
                >
                  <div
                    className={`h-4 w-5 rounded-full animate-pulse ${
                      index === 1 ? 'bg-white/80' : 'bg-gray-200'
                    }`}
                  />
                </div>
              ))}
            </div>

            <p className="mt-4 text-[13px] font-bold tracking-tight text-gray-400">
              서울역 시간표 데이터를 새로 불러오는 중입니다.
            </p>
          </div>

          <div className="flex items-center justify-between text-[13px] font-black text-gray-500 px-4 py-2 bg-gray-50/80 rounded-xl mb-2">
            <div className="h-3.5 w-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-3.5 w-10 rounded-full bg-gray-200 animate-pulse" />
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {hourRows.slice(0, isMobile ? 3 : 4).map((hour, index) => (
              <TimetableSkeletonHourBlock
                key={`skeleton-block-${hour}`}
                emphasize={index === 0}
              />
            ))}
          </div>
        </div>
      );
    }

    if (subwayArrivals.error) {
      return (
        <div className="p-8 bg-red-50 rounded-3xl border border-red-100 flex flex-col items-center text-center gap-3 animate-fade-in">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
            <Info size={24} />
          </div>
          <p className="text-red-800 font-black text-sm">{subwayArrivals.error}</p>
          <p className="text-red-500 text-[13px] font-medium leading-relaxed">
            {subwayArrivals.message || 'API 인증키 문제이거나 일시적인 통신 장애일 수 있습니다.'}
          </p>
          <button
            onClick={() => onTimetableTabChange(currentDayType)}
            className="mt-2 px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-bold text-[13px] hover:bg-red-100 transition-colors"
          >
            다시 시도
          </button>
        </div>
      );
    }

    return (
      <div className="category-subway animate-fade-in h-full flex flex-col">
        <div className="sticky top-0 z-10 bg-white pb-4 space-y-4">
          <div className="flex justify-between items-start gap-3 px-1">
            <div className="min-w-0 flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#3D53B3] text-white shadow-lg shadow-[#3D53B3]/20 flex flex-col items-center justify-center leading-none">
                <span className="text-[13px] font-black tracking-tight">1호선</span>
                <span className="mt-1 text-[8px] font-bold text-blue-100">LINE</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[20px] font-black text-gray-900 leading-tight">서울역</h2>
                </div>
                <span className="text-[13px] font-bold text-gray-400">수도권 지하철</span>
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
            {Object.entries(dayNames).map(([value, name]) => (
              <button
                key={value}
                onClick={() => onTimetableTabChange(value)}
                className={`flex-1 py-2.5 text-[13px] font-black rounded-[14px] transition-all ${
                  currentDayType === value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <div
            ref={hourScrollRef}
            className={`flex gap-2.5 overflow-x-auto pt-2 pb-4 no-scrollbar border-b border-gray-100 px-1 ${isMobile ? '' : 'cursor-grab active:cursor-grabbing select-none'}`}
            onMouseDown={handleHourMouseDown}
            onMouseMove={handleHourMouseMove}
            onMouseUp={resetHourDrag}
            onMouseLeave={resetHourDrag}
            onDragStart={(event) => event.preventDefault()}
          >
            {hourRows.map((hour) => (
              <button
                id={`btn-hour-${hour}`}
                key={hour}
                onMouseDown={(event) => {
                  if (isHourDraggingRef.current || dragDistanceRef.current >= 6) {
                    event.preventDefault();
                  }
                }}
                onClick={() => handleHourClick(hour)}
                className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-[20px] font-black text-[14px] transition-all ${
                  selectedHour === hour
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                {hour}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[13px] font-black text-gray-500 px-4 py-2 bg-gray-50/80 rounded-xl mb-2">
          <span>상행</span>
          <span>하행</span>
        </div>

        <div ref={listScrollRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-0">
          {hourRows.map((hour) => (
            <TimetableRow key={hour} hour={hour} />
          ))}
        </div>
      </div>
    );
  };

  const StarbucksSection = () => {
    if (!starbucks) return null;

    return (
      <div className="space-y-6 category-starbucks animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#00704a] rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Coffee size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-[20px] font-black text-gray-900 leading-tight">{starbucks.name}</h2>
            <p className="text-[13px] font-bold text-[#00704a]">리저브 매장</p>
          </div>
        </div>
        <div className="p-5 bg-green-50/50 border border-green-100 rounded-[24px] space-y-4">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-green-700 mt-0.5" />
            <p className="text-gray-700 font-medium text-[14px] leading-relaxed">{starbucks.address}</p>
          </div>
          <button className="w-full py-4 bg-white border border-green-100 rounded-2xl text-green-700 font-black text-[14px] flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all">
            길찾기
            <ChevronRight size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    );
  };

  const BusSection = () => {
    if (!busStop) return null;

    const station = busStop.station;
    const arrivals = [...(busStop.arrivals || [])].sort((a, b) => {
      const aTime = Number(a.predictTimeSec1 || a.predictTime1 || Number.POSITIVE_INFINITY);
      const bTime = Number(b.predictTimeSec1 || b.predictTime1 || Number.POSITIVE_INFINITY);
      return aTime - bTime;
    });

    const formatMinutes = (minutes) => {
      if (minutes === null || minutes === undefined || Number.isNaN(Number(minutes))) return '-';
      if (Number(minutes) <= 0) return '곧 도착';
      return `${minutes}분`;
    };

    const formatRouteName = (routeName) => {
      const normalized = String(routeName || '').trim();
      const match = normalized.match(/^(\d+)([A-Za-z가-힣]+)$/);
      if (!match) return normalized || '-';
      const [, number, region] = match;
      return `${region}${number}`;
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#299738] text-white shadow-lg shadow-green-200 flex flex-col items-center justify-center leading-none">
              <span className="text-[13px] font-black tracking-tight">BUS</span>
              <span className="mt-1 text-[8px] font-bold text-green-100">{station?.mobileNo || '-'}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] font-black text-gray-900 leading-tight">{station?.name}</h2>
              </div>
              <span className="text-[13px] font-medium text-gray-400">
              {station?.regionName} {station?.mobileNo}
              </span>
            </div>
          </div>
          <button
            onClick={() => onBusRefresh?.(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
            title={'\uC0C8\uB85C\uACE0\uCE68'}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={busStop.loading ? 'animate-spin' : ''}
              aria-hidden="true"
            >
              <path
                d="M20 5V10H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 10C18.9 6.8 15.8 4.5 12.2 4.5C7.7 4.5 4 8.2 4 12.7C4 17.2 7.7 20.9 12.2 20.9C15.8 20.9 18.8 18.6 19.9 15.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {busStop.error ? (
          <div className="p-6 bg-red-50 rounded-3xl border border-red-100 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
              <Info size={24} />
            </div>
            <p className="text-red-800 font-black text-sm">{busStop.error}</p>
            <p className="text-red-500 text-[13px] font-medium leading-relaxed">
              {busStop.message || '\uBC84\uC2A4 \uB3C4\uCC29\uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {arrivals.map((bus) => (
              <div key={`${bus.routeId}-${bus.routeName}`} className="p-4 rounded-[24px] bg-gray-50 border border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[18px] font-[900] tracking-tight text-[#299738]">{formatRouteName(bus.routeName)}</span>
                      <span className="text-[13px] font-medium text-gray-400">{bus.routeDestName}</span>
                    </div>
                    <p className="mt-1 text-[13px] font-medium text-gray-400">
                      {'\uB2E4\uC74C \uC815\uB958\uC7A5'} {bus.stationNm1 || '-'} / {'\uB450 \uBC88\uC9F8'} {bus.stationNm2 || '-'}
                    </p>
                  </div>
                  <div className="w-[88px] shrink-0 text-right">
                    <p className="text-[18px] font-medium tracking-tight text-gray-900">
                      {formatMinutes(bus.predictTime1)}
                    </p>
                    <p className="text-[13px] font-medium text-gray-400 whitespace-nowrap">
                      {bus.locationNo1 ? `${bus.locationNo1}\uC815\uB958\uC7A5 \uC804` : '\uC811\uADFC \uC911'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 border border-gray-100">
                  <div>
                    <p className="text-[13px] font-medium text-gray-400">{'\uB450 \uBC88\uC9F8 \uB3C4\uCC29'}</p>
                    <p className="text-[13px] font-medium text-gray-900">{formatMinutes(bus.predictTime2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-medium text-gray-400">{'\uC800\uC0C1/\uD63C\uC7A1'}</p>
                    <p className="text-[13px] font-medium text-gray-900">
                      {bus.lowPlate1 ? '\uC800\uC0C1' : '\uC77C\uBC18'} / {bus.crowded1 === 1 ? '\uC5EC\uC720' : bus.crowded1 === 2 ? '\uBCF4\uD1B5' : '\uD63C\uC7A1'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {arrivals.length === 0 && (
              <div className="p-6 rounded-[24px] bg-gray-50 border border-gray-100 text-center">
                <p className="text-[14px] font-bold text-gray-500">{'\uD45C\uC2DC\uD560 \uBC84\uC2A4 \uB3C4\uCC29\uC815\uBCF4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const CurrentLocationSection = () => {
    if (!currentLocationInfo) return null;

    const formatDistance = (distanceMeters) => {
      if (!Number.isFinite(distanceMeters)) return '-';
      if (distanceMeters < 1000) return `${distanceMeters}m`;
      return `${(distanceMeters / 1000).toFixed(1)}km`;
    };

    const currentCoordsText = `${Number(currentLocationInfo.coords?.lat || 0).toFixed(6)}, ${Number(currentLocationInfo.coords?.lng || 0).toFixed(6)}`;
    const handleCopyCurrentCoords = async () => {
      try {
        await navigator.clipboard.writeText(currentCoordsText);
        setCopiedCoords(true);
        window.setTimeout(() => setCopiedCoords(false), 1500);
      } catch (error) {
        console.error('Failed to copy current coordinates:', error);
      }
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FF4D00] text-white shadow-lg shadow-[#FF4D00]/20 flex items-center justify-center">
            <Crosshair size={22} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[20px] font-black text-gray-900 leading-tight">{currentLocationInfo.title}</h2>
            </div>
            <p className="text-[13px] font-medium text-gray-400">
              {currentLocationInfo.loading ? '현재 위치 기반 정보를 정리하는 중입니다.' : currentLocationInfo.fetchedAt}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-[24px] bg-orange-50/60 border border-orange-100 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-[#FF4D00] mt-0.5" />
            <div className="min-w-0">
              <p className="text-[15px] font-black text-gray-900 leading-snug">
                현재 위치
              </p>
              <p className="mt-1 text-[13px] font-medium text-gray-500">
                {currentLocationInfo.loading
                  ? '주소 정보를 확인 중'
                  : currentLocationInfo.addressPrimary || currentLocationInfo.addressSecondary}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 border border-orange-100">
            <div>
              <p className="text-[13px] font-bold text-gray-400">현재 좌표</p>
              <button
                type="button"
                onClick={handleCopyCurrentCoords}
                className="mt-1 flex max-w-[160px] items-center gap-1.5 text-[13px] font-semibold text-gray-900 transition-colors hover:text-[#FF4D00]"
                title="좌표 복사"
              >
                {copiedCoords ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} strokeWidth={2.5} />}
                <span className="block min-w-0 truncate whitespace-nowrap">{currentCoordsText}</span>
              </button>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-bold text-gray-400">주변 반경</p>
              <p className="text-[13px] font-semibold text-gray-900">{formatDistance(currentLocationInfo.nearbyRadiusMeters)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="p-4 rounded-[24px] bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-[#FF4D00]" />
                <span className="text-[13px] font-black text-gray-500">주변 바블</span>
              </div>
              <span className="text-[18px] font-black text-gray-900">{currentLocationInfo.nearbyMemoCount}</span>
            </div>
            <p className="mt-3 text-[13px] font-medium text-gray-700 leading-relaxed">
              {currentLocationInfo.nearestMemo
                ? `${formatDistance(currentLocationInfo.nearestMemo.distanceMeters)} 거리의 ${currentLocationInfo.nearestMemo.nickname}`
                : '가까운 바블이 아직 없습니다.'}
            </p>
            {currentLocationInfo.nearestMemo && (
              <p className="mt-2 text-[13px] font-medium text-gray-400 line-clamp-2">
                {currentLocationInfo.nearestMemo.text}
              </p>
            )}
          </div>

          <div className="p-4 rounded-[24px] bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#FF4D00]" />
                <span className="text-[13px] font-black text-gray-500">주변 명소</span>
              </div>
              <span className="text-[13px] font-bold text-gray-400">
                {currentLocationInfo.nearbyPlaces?.length || 0}곳
              </span>
            </div>

            {currentLocationInfo.nearbyPlacesError ? (
              <p className="mt-3 text-[13px] font-medium text-red-500">{currentLocationInfo.nearbyPlacesError}</p>
            ) : currentLocationInfo.nearbyPlaces?.length ? (
              <div className="mt-3 space-y-3">
                {currentLocationInfo.nearbyPlaces.map((place) => (
                  <a
                    key={place.id}
                    href={place.placeUrl || place.searchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl bg-white border border-gray-100 px-4 py-4 transition-colors hover:border-[#FF4D00]/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[14px] font-black text-gray-900 leading-tight">{place.name}</p>
                        <p className="mt-2 text-[13px] font-semibold text-gray-500">{place.description || '명소'}</p>
                        <p className="mt-2 text-[13px] font-medium text-gray-400 truncate">{place.address || '주소 정보 없음'}</p>
                        <div className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-[#FF4D00]">
                          <span>자세히 보기</span>
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      <span className="shrink-0 text-[13px] font-semibold text-[#FF4D00]">
                        {formatDistance(place.distanceMeters)}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[13px] font-medium text-gray-400">주변 명소를 찾지 못했습니다.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {(memo || subwayArrivals || starbucks || busStop || currentLocationInfo) && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] md:hidden bg-transparent"
            onClick={onClose}
          />

          <motion.div
            style={{ height: isMobile ? sheetHeight : '100vh' }}
            initial={isMobile ? { height: 0 } : { x: -400, opacity: 0 }}
            animate={isMobile ? {} : { x: 0, opacity: 1 }}
            exit={isMobile ? { height: 0 } : { x: -400, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed z-[10000] bg-white shadow-2xl flex flex-col md:left-0 md:top-0 md:h-screen md:w-[380px] bottom-0 left-0 w-full rounded-t-[32px] md:rounded-none overflow-hidden"
          >
            <motion.div
              className={`flex-shrink-0 touch-none select-none relative z-30 bg-white ${isMobile ? 'cursor-grab' : ''}`}
              onPan={isMobile ? handlePan : undefined}
              onPanEnd={isMobile ? handlePanEnd : undefined}
            >
              <div className="px-6 pt-5 pb-4">
                {isMobile && (
                  <div className="w-full flex justify-center pb-6">
                    <div className="w-14 h-1.5 bg-gray-200 rounded-full" />
                  </div>
                )}
                {!isMobile && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="logo-font text-[20px] font-black text-[#FF4D00] mix-blend-multiply">BABBLE</span>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all group">
                      <X size={20} className="text-gray-400 group-hover:text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            <div
              ref={contentRef}
              className={`flex-1 px-6 custom-scrollbar scroll-smooth ${
                isSubwayOnlyView ? 'overflow-hidden pb-0' : 'overflow-y-auto pb-20'
              }`}
            >
              <MemoSection />
              <SubwaySection />
              <BusSection />
              <CurrentLocationSection />
              <StarbucksSection />
              {!isTransitOnlyView && <div className="h-24" />}
            </div>

            {memo && (
              <div className="px-6 py-5 bg-white border-t border-gray-100 flex-shrink-0 z-40 bg-white/80 backdrop-blur-md">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="말하고 싶은 바블을 적어주세요"
                    className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-200 rounded-[22px] text-[13px] font-bold focus:outline-none focus:ring-4 focus:ring-[#FF4D00]/10 focus:bg-white transition-all shadow-inner"
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







