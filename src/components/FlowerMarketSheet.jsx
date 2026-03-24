import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, animate } from 'framer-motion';
import { X, MapPin, Navigation, Phone, Clock3, Link as LinkIcon, Info } from 'lucide-react';

const FlowerPetalIcon = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="-16 -16 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <g transform="scale(0.9)">
      <ellipse cx="0" cy="-8.8" rx="4.6" ry="7.4" fill={color} />
      <ellipse cx="8.4" cy="-2.7" rx="4.6" ry="7.4" transform="rotate(72 8.4 -2.7)" fill={color} />
      <ellipse cx="5.2" cy="7.1" rx="4.6" ry="7.4" transform="rotate(144 5.2 7.1)" fill={color} />
      <ellipse cx="-5.2" cy="7.1" rx="4.6" ry="7.4" transform="rotate(-144 -5.2 7.1)" fill={color} />
      <ellipse cx="-8.4" cy="-2.7" rx="4.6" ry="7.4" transform="rotate(-72 -8.4 -2.7)" fill={color} />
      <circle cx="0" cy="0" r="4.8" fill={color} />
    </g>
  </svg>
);

const FlowerMarketSheet = ({ market, onClose, onDirections }) => {
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

  useEffect(() => {
    if (!market) {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
      return;
    }

    if (isMobile) {
      animate(sheetHeight, window.innerHeight * 0.48, { type: 'spring', damping: 30, stiffness: 400 });
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      sheetHeight.set(window.innerHeight);
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
      document.body.style.width = '';
    };
  }, [isMobile, market, sheetHeight]);

  const handlePan = (_event, info) => {
    if (!isMobile) return;

    let nextHeight = sheetHeight.get() - info.delta.y;
    const maxHeight = windowHeight * 0.92;
    if (nextHeight > maxHeight) nextHeight = maxHeight;
    sheetHeight.set(nextHeight);
  };

  const handlePanEnd = (_event, info) => {
    if (!isMobile) return;

    const currentHeight = sheetHeight.get();
    const velocity = info.velocity.y;
    const snapTransition = { type: 'spring', damping: 38, stiffness: 450 };
    const halfHeight = windowHeight * 0.48;
    const fullHeight = windowHeight * 0.9;

    if (currentHeight > windowHeight * 0.65) {
      animate(sheetHeight, velocity > 400 ? halfHeight : fullHeight, snapTransition);
      return;
    }

    if (currentHeight > windowHeight * 0.2) {
      if (velocity > 400) {
        animate(sheetHeight, 0, snapTransition).then(() => onClose());
      } else if (velocity < -400) {
        animate(sheetHeight, fullHeight, snapTransition);
      } else {
        animate(sheetHeight, halfHeight, snapTransition);
      }
      return;
    }

    animate(sheetHeight, 0, snapTransition).then(() => onClose());
  };

  if (!market) return null;

  const sections = [
    market.address ? {
      key: 'address',
      label: '주소',
      icon: MapPin,
      content: market.address
    } : null,
    market.access?.length ? {
      key: 'access',
      label: '이용 방법',
      icon: Navigation,
      content: market.access
    } : null,
    market.hours?.length ? {
      key: 'hours',
      label: '운영시간',
      icon: Clock3,
      content: market.hours
    } : null,
    market.phone ? {
      key: 'phone',
      label: '전화번호',
      icon: Phone,
      content: market.phone
    } : null,
    market.url ? {
      key: 'url',
      label: 'URL',
      icon: LinkIcon,
      content: market.url
    } : null,
    market.amenities?.length ? {
      key: 'amenities',
      label: '기타 편의사항',
      icon: Info,
      content: market.amenities
    } : null
  ].filter(Boolean);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] md:hidden"
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
          {isMobile ? (
            <div className="px-6 pt-5 pb-4 space-y-4">
              <div className="w-full flex justify-center pb-2">
                <div className="w-14 h-1.5 bg-gray-200 rounded-full" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FF2FA3] text-white flex items-center justify-center shadow-lg">
                  <FlowerPetalIcon size={18} color="#FFFFFF" />
                </div>
                <div>
                  <p className="text-[13px] font-black text-[#FF2FA3]">FLOWER MARKET</p>
                  <h2 className="text-[20px] font-black text-gray-900 leading-tight">{market.name}</h2>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FF2FA3] text-white flex items-center justify-center">
                  <FlowerPetalIcon size={17} color="#FFFFFF" />
                </div>
                <div>
                  <p className="text-[13px] font-black text-[#FF2FA3]">FLOWER MARKET</p>
                  <h2 className="text-[18px] font-black text-gray-900">{market.name}</h2>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                <X size={20} />
              </button>
            </div>
          )}
        </motion.div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-4 pb-6">
          <div className="space-y-5">
            <div className="p-5 rounded-[28px] bg-gradient-to-br from-[#FFF1F8] to-[#FFE3F2] border border-[#FFD0E8]">
              <div className="flex items-center gap-2 mb-3">
                <FlowerPetalIcon size={16} color="#FF2FA3" />
                <span className="text-[13px] font-black text-[#FF2FA3]">{'\uAF43 \uB3C4\uB9E4/\uC18C\uB9E4 \uBCF5\uD569 \uC2DC\uC7A5'}</span>
              </div>
              <p className="text-[15px] font-bold text-gray-900 leading-relaxed">
                {'\uC808\uD654, \uB09C, \uAD00\uC5FD, \uD654\uBD84\uB958\uB97C \uD55C \uBC88\uC5D0 \uBCFC \uC218 \uC788\uB294 \uC591\uC7AC\uB3D9 \uB300\uD45C \uD654\uD6FC \uC2DC\uC7A5\uC785\uB2C8\uB2E4.'}
              </p>
            </div>

            <div className="space-y-3">
              {sections.map((section) => {
                const SectionIcon = section.icon;
                const isList = Array.isArray(section.content);

                return (
                  <div key={section.key} className="p-5 rounded-[24px] bg-gray-50 border border-gray-100">
                    <div className="flex items-start gap-3">
                      <SectionIcon size={18} className="text-[#FF2FA3] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[13px] font-black text-gray-400 mb-2">{section.label}</p>
                        {isList ? (
                          <div className="space-y-1.5">
                            {section.content.map((item) => (
                              <p key={item} className="text-[14px] font-bold text-gray-900 leading-relaxed">
                                {item}
                              </p>
                            ))}
                          </div>
                        ) : section.key === 'url' ? (
                          <a
                            href={section.content}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[14px] font-bold text-[#FF2FA3] break-all"
                          >
                            {section.content}
                          </a>
                        ) : section.key === 'phone' ? (
                          <a href={`tel:${section.content}`} className="text-[14px] font-bold text-gray-900">
                            {section.content}
                          </a>
                        ) : (
                          <p className="text-[14px] font-bold text-gray-900 leading-relaxed">{section.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-3 p-4 rounded-[22px] border border-[#FFD0E8] bg-[#FFF8FC]">
              <Navigation size={18} className="text-[#FF2FA3]" />
              <p className="text-[13px] font-bold text-gray-700">
                {'\uAE38\uCC3E\uAE30 \uBC84\uD2BC\uC740 \uBAA8\uBC14\uC77C \uBC14\uD140\uC2DC\uD2B8\uC5D0\uC11C\uB9CC \uD45C\uC2DC\uB429\uB2C8\uB2E4.'}
              </p>
            </div>
          </div>
        </div>

        {isMobile && (
          <div className="px-6 py-5 bg-white border-t border-gray-100 flex-shrink-0">
            <button
              onClick={onDirections}
              className="w-full py-4 rounded-[22px] bg-[#FF2FA3] text-white font-black text-[15px] flex items-center justify-center gap-2 shadow-[0_14px_28px_rgba(255,47,163,0.24)]"
            >
              <Navigation size={18} strokeWidth={2.5} />
              {'TMAP \uAE38\uCC3E\uAE30'}
            </button>
            <div style={{ height: 'env(safe-area-inset-bottom, 12px)' }} />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default FlowerMarketSheet;
