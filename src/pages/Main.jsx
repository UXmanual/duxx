import React, { useState, useEffect, useRef } from 'react';
import { Map, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Crosshair, MessageSquare, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

/**
 * [Page] 메인 페이지 (지도 메모 기능 통합 버전)
 * @version 12.0.0
 * @author Antigravity
 * @description 
 * - Supabase 백엔드를 연동하여 지도 위에 말풍선 메모를 남기는 기능을 구현했습니다.
 * - 화이트 배경에 주황색 테두리가 있는 프리미엄 말풍선 UI를 적용했습니다.
 */

const Main = () => {
  const { isDark } = useTheme();
  const [map, setMap] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  
  // 메모 관련 상태
  const [memos, setMemos] = useState([]);
  const [isMemoMode, setIsMemoMode] = useState(false);

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAPS_API_KEY,
    libraries: ['services', 'clusterer', 'drawing'],
  });

  // 초기 메모 데이터 로드
  const fetchMemos = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMemos(data);
      }
    } catch (e) {
      console.warn('Supabase fetch failed:', e);
    }
  };

  const requestLocation = (shouldPan = true) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const pos = { lat, lng };
          
          setMyLocation(pos);
          
          if (map && shouldPan) {
            map.setCenter(new window.kakao.maps.LatLng(lat, lng));
            map.setLevel(4);
          }
        },
        null,
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 30000 
        }
      );
    }
  };

  useEffect(() => {
    if (map) {
      requestLocation(true);
      fetchMemos();
    }
  }, [map]);

  const handleMyLocationBtn = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    requestLocation(true);
  };

  // 지도 클릭 시 메모 생성
  const handleMapClick = async (_t, mouseEvent) => {
    if (!isMemoMode) return;
    if (!supabase) {
      alert('데이터베이스 연결 설정이 완료되지 않았습니다. .env 환경 변수를 확인해주세요.');
      return;
    }

    const latlng = mouseEvent.latLng;
    const text = prompt('여기에 남길 메모를 입력해주세요:');
    
    if (text && text.trim()) {
      const newMemo = {
        lat: latlng.getLat(),
        lng: latlng.getLng(),
        text: text.trim()
      };

      const { data, error } = await supabase
        .from('memos')
        .insert([newMemo])
        .select();

      if (!error && data) {
        setMemos(prev => [...prev, data[0]]);
        setIsMemoMode(false); // 작성 후 모드 해제
      }
    }
  };

  // 메모 삭제 처리
  const handleDeleteMemo = async (id) => {
    if (!supabase) return;
    if (confirm('이 메모를 삭제하시겠습니까?')) {
      const { error } = await supabase
        .from('memos')
        .delete()
        .eq('id', id);

      if (!error) {
        setMemos(prev => prev.filter(m => m.id !== id));
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#f8f9fa] relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full border-t border-l border-gray-300 bg-[linear-gradient(to_right,#e9ecef_1px,transparent_1px),linear-gradient(to_bottom,#e9ecef_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        <div className="relative w-16 h-16 bg-gray-200 rounded-full animate-pulse flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer" />
        </div>
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2.5s infinite linear;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative bg-white overflow-hidden">
      <Map
        center={{ lat: 37.5665, lng: 126.9780 }}
        level={4}
        onCreate={(m) => {
          setMap(m);
          m.setMaxLevel(11);
          setTimeout(() => m.relayout(), 100);
        }}
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%' }}
        className={isDark ? 'kakao-dark-theme' : ''}
      >
        {/* 현위치 마커 */}
        {myLocation && (
          <CustomOverlayMap 
            position={myLocation} 
            zIndex={999}
            xAnchor={0.5}
            yAnchor={0.5}
          >
            <div className={`relative flex items-center justify-center pointer-events-none ${isDark ? 'custom-marker-original-color' : ''}`}>
              <div className="absolute w-8 h-8 bg-[#FF4D00] rounded-full animate-ping opacity-30" />
              <div className="relative w-[24px] h-[24px] bg-[#FF4D00] border-2 border-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                <div className="w-[6px] h-[6px] bg-white rounded-full" />
              </div>
            </div>
          </CustomOverlayMap>
        )}

        {/* 지도 메모 말풍선 UI */}
        {memos.map((memo) => (
          <CustomOverlayMap
            key={memo.id}
            position={{ lat: memo.lat, lng: memo.lng }}
            yAnchor={1.2}
            zIndex={10}
          >
            <div className={`relative px-4 py-2 bg-white border-[1.5px] border-[#FF4D00] rounded-[14px] shadow-lg flex items-center gap-2 group animate-pop-in ${isDark ? 'custom-marker-original-color' : ''}`}>
              <span className="text-[14px] font-medium text-black whitespace-nowrap leading-none tracking-tight">
                {memo.text}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMemo(memo.id);
                }}
                className="w-4 h-4 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 hover:text-[#FF4D00] transition-colors"
                aria-label="메모 삭제"
              >
                <X size={10} strokeWidth={3} />
              </button>
              
              {/* [Simplified Tail] 가로 폭을 줄여 더 심플해진 SVG 꼬리 */}
              <div className="absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-[10px] h-2">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 8L0 0H10L5 8Z" fill="white"/>
                  <path d="M0 0L5 8L10 0" stroke="#FF4D00" strokeWidth="1.5"/>
                </svg>
              </div>
            </div>
          </CustomOverlayMap>
        ))}
      </Map>

      {/* [Interface Layer] 우측 컨트롤 스택 */}
      <div className="fixed bottom-0 right-0 z-[9999] pointer-events-none">
        <div className="w-full px-10 py-8">
          <div className="flex flex-col items-center justify-end gap-3 pointer-events-auto">
            {/* 메모 작성 모드 버튼 */}
            <button 
              onClick={() => setIsMemoMode(!isMemoMode)}
              className={`w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-all border shadow-lg
                ${isMemoMode 
                  ? 'bg-[#FF4D00] border-[#FF4D00] text-white' 
                  : (isDark 
                    ? 'bg-[#1a1c1e]/90 border-white/10 text-white' 
                    : 'bg-white border-gray-200 text-[#1a1c1e]')}
              `}
              aria-label="메모 작성 모드"
            >
              <MessageSquare size={22} fill={isMemoMode ? "currentColor" : "none"} />
            </button>

            {/* 현위치 버튼 */}
            <button 
              onPointerDown={handleMyLocationBtn}
              className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all border
                ${isDark 
                  ? 'bg-[#1a1c1e]/90 border-white/10 text-white' 
                  : 'bg-white border-gray-200 text-[#1a1c1e]'}
              `}
              aria-label="현위치"
            >
              <Crosshair size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .kakao-dark-theme { filter: invert(100%) hue-rotate(180deg) brightness(0.9) grayscale(0.2); background-color: #fff !important; }
        .kakao-dark-theme img { filter: none !important; }
        
        .custom-marker-original-color {
          filter: invert(100%) hue-rotate(180deg) brightness(1.12) grayscale(0) !important;
        }

        @keyframes pop-in {
          0% { transform: scale(0.8) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-pop-in {
          animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </div>
  );
};

export default Main;
