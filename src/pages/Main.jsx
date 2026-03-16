import React, { useState, useEffect, useRef } from 'react';
import { Map, CustomOverlayMap, MapMarker, MarkerClusterer, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Crosshair, MessageSquare, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
};

/**
 * [Page] 메인 페이지 (지도 메모 기능 통합 버전)
 * @version 15.5.0
 * @author Antigravity
 * @description 
 * - Supabase 백엔드를 연동하여 지도 위에 말풍선 메모를 남기는 기능을 구현했습니다.
 * - 줌 레벨 기반 메모 표시 최적화: 레벨 6~11에서는 말풍선을 숫자 원형 뱃지로 축약하여 표시합니다.
 * - 개별 말풍선 하단에 생성 날짜와 시간을 표기했습니다.
 */

const Main = () => {
  const { isDark } = useTheme();
  const [map, setMap] = useState(null);
  const [mapLevel, setMapLevel] = useState(4);
  const [myLocation, setMyLocation] = useState(null);
  
  // 메모 관련 상태
  const [memos, setMemos] = useState([]);
  const [isMemoMode, setIsMemoMode] = useState(false);
  const [expandedMemoIds, setExpandedMemoIds] = useState([]); // 확장된 메모 ID 목록 추적

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
        // 삭제 시 확장 상태도 제거
        setExpandedMemoIds(prev => prev.filter(memoId => memoId !== id));
      }
    }
  };

  // 텍스트 말줄임 토글 처리
  const toggleMemoExpand = (id, e) => {
    e.stopPropagation();
    setExpandedMemoIds(prev => 
      prev.includes(id) ? prev.filter(memoId => memoId !== id) : [...prev, id]
    );
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
          setMapLevel(m.getLevel());
          setTimeout(() => m.relayout(), 100);
        }}
        onZoomChanged={(m) => setMapLevel(m.getLevel())}
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

        {/* 지도 메모 표시 로직: 줌 레벨에 따른 동적 렌더링 (레벨 6 이상일 때 숫자 뱃지로 축약) */}
        {mapLevel >= 6 ? (
          <MarkerClusterer
            averageCenter={true}
            minLevel={6} // 레벨 6 이상에서만 클러스터링
            minClusterSize={1} // 1개의 마커도 숫자 뱃지로 변환
            disableClickZoom={false}
            styles={[{
              width: '32px', height: '32px',
              background: '#FF4D00',
              color: '#fff',
              textAlign: 'center',
              fontWeight: 'bold',
              lineHeight: '28px', // 테두리 두께 보정
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              fontSize: '14px'
            }]}
          >
            {memos.map((memo) => (
              <MapMarker 
                key={memo.id} 
                position={{ lat: memo.lat, lng: memo.lng }} 
              />
            ))}
          </MarkerClusterer>
        ) : (
          memos.map((memo) => (
            <CustomOverlayMap
              key={memo.id}
              position={{ lat: memo.lat, lng: memo.lng }}
              yAnchor={1.2}
              zIndex={10}
            >
              <div className={`relative px-3 py-2 bg-white border-[1.5px] border-[#FF4D00] rounded-[8px] shadow-lg flex flex-col gap-1 group animate-pop-in ${isDark ? 'custom-marker-original-color' : ''}`}>
                {/* 상단 텍스트 영역: 내용이 길 경우 가로로 길어지다 최대 넓이 초과 시 줄바꿈 처리 */}
                <div className="flex items-start justify-between gap-3 min-w-[120px] max-w-[280px]">
                  <span 
                    onClick={(e) => toggleMemoExpand(memo.id, e)}
                    className={`text-[14px] font-medium text-black leading-tight tracking-tight break-all whitespace-pre-wrap flex-1 cursor-pointer transition-all ${!expandedMemoIds.includes(memo.id) ? 'line-clamp-1' : ''}`}
                    title={!expandedMemoIds.includes(memo.id) ? "클릭하여 더보기" : ""}
                  >
                    {memo.text}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMemo(memo.id);
                    }}
                    className="flex-shrink-0 flex items-center justify-center text-zinc-400 hover:text-[#FF4D00] transition-colors mt-0.5"
                    aria-label="메모 삭제"
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </div>
                {/* [Date Row] 하단 날짜, 폰트사이즈 10px */}
                <span className="text-[10px] text-zinc-400 font-medium tracking-wide">
                  {formatDateTime(memo.created_at)}
                </span>
                
                {/* [Simplified Tail] */}
                <div className="absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-[10px] h-2">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 8L0 0H10L5 8Z" fill="white"/>
                    <path d="M0 0L5 8L10 0" stroke="#FF4D00" strokeWidth="1.5"/>
                  </svg>
                </div>
              </div>
            </CustomOverlayMap>
          ))
        )}
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
