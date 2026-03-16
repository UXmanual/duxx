import React, { useState, useEffect, useRef, useMemo } from 'react';
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
 * @version 15.14
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
  const [expandedGroupIds, setExpandedGroupIds] = useState([]); // 그룹핑된 말풍선 확장 상태 추적

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAPS_API_KEY,
    libraries: ['services', 'clusterer', 'drawing'],
  });

  // 하버사인 거리 계산 로직 (미터 단위)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
              Math.cos(p1) * Math.cos(p2) *
              Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 500m 이내 메모 그룹핑 (최신 기준)
  const groupedMemos = useMemo(() => {
    // 가장 최신 메모부터 그룹핑의 기준(anchor)으로 삼기 위해 역순 정렬
    let unassigned = [...memos].reverse(); 
    let groups = [];
    while (unassigned.length > 0) {
      let anchor = unassigned.shift();
      let group = [anchor];
      let remaining = [];
      for (let m of unassigned) {
        if (getDistance(anchor.lat, anchor.lng, m.lat, m.lng) <= 500) {
          group.push(m);
        } else {
          remaining.push(m);
        }
      }
      unassigned = remaining;
      // HTML 순서상 위에서 아래로 렌더링되므로, 오래된 것이 위에 오도록 배열 재배치
      groups.push(group.reverse());
    }
    return groups;
  }, [memos]);

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

  // 말풍선 그룹 확장 토글 처리
  const toggleGroupExpand = (id, e) => {
    e.stopPropagation();
    setExpandedGroupIds(prev => 
      prev.includes(id) ? [] : [id]
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
          groupedMemos.map((group) => {
            const anchorMemo = group[group.length - 1]; // 그룹의 기준 좌표는 가장 하단에 렌더링될 최신 메모
            const hiddenCount = group.length - 1;
            const isGroupExpanded = expandedGroupIds.includes(anchorMemo.id);

            return (
              <CustomOverlayMap
                key={`group-${anchorMemo.id}`}
                position={{ lat: anchorMemo.lat, lng: anchorMemo.lng }}
                xAnchor={0}
                yAnchor={0}
                zIndex={10}
              >
                {/* 0x0 크기의 앵커 기준점 */}
                <div className="relative w-0 h-0 group animate-pop-in pointer-events-none">
                  {/* 기준(최신) 말풍선을 감싸는 Wrapper */}
                  <div className={`absolute bottom-0 left-[-18px] flex flex-col pb-[6px] pointer-events-auto ${isDark ? 'custom-marker-original-color' : ''}`}>
                    
                    <div 
                      className={`relative px-3 py-2 border-[1.5px] border-[#FF4D00] rounded-[8px] shadow-lg flex flex-col gap-1 w-max min-w-[120px] max-w-[280px] select-none ${hiddenCount > 0 ? 'cursor-pointer' : ''} ${isGroupExpanded ? 'bg-[#FF4D00]' : 'bg-white'}`}
                      onClick={(e) => {
                        if (hiddenCount > 0) toggleGroupExpand(anchorMemo.id, e);
                      }}
                    >
                      
                      {/* 펼쳐진 이전 메모들 (최신 메모 왼쪽 모서리에 딱 맞춤) */}
                      {hiddenCount > 0 && isGroupExpanded && (
                        <div className="absolute bottom-full left-[-1.5px] mb-[6px] flex flex-col items-start gap-[6px] cursor-default select-none" onClick={(e) => e.stopPropagation()}>
                          {group.slice(0, hiddenCount).map(memo => (
                            <div key={memo.id} className="relative px-3 py-2 bg-white border-[1.5px] border-[#FF4D00] rounded-[8px] shadow-lg flex flex-col gap-1 w-max min-w-[120px] max-w-[280px] animate-pop-in">
                              <div className="w-full relative z-10 text-left">
                                <span className="text-[14px] font-medium text-black leading-tight tracking-tight break-all whitespace-pre-wrap line-clamp-2">
                                  {memo.text}
                                </span>
                              </div>
                              <div className="text-[10px] text-zinc-400 font-medium tracking-wide relative z-10 text-left flex items-center gap-1 mt-0.5">
                                <span>{formatDateTime(memo.created_at)}</span>
                                <span className="text-zinc-300">|</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMemo(memo.id);
                                  }}
                                  className="hover:text-[#FF4D00] transition-colors"
                                  aria-label="메모 삭제"
                                >
                                  삭제
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 확장 안 되었을 때 +N 뱃지 */}
                      {hiddenCount > 0 && !isGroupExpanded && (
                        <div className="absolute -top-[10px] -right-[12px] bg-white text-[#FF4D00] text-[13px] font-extrabold px-1.5 py-0.5 rounded-full border-2 border-[#FF4D00] shadow-md z-30 flex items-center justify-center leading-none min-w-[32px] pointer-events-none">
                          +{hiddenCount}
                        </div>
                      )}

                      {/* 기준 최신 메모 상단 텍스트 영역 */}
                      <div className="w-full relative z-10 text-left">
                        <span className={`text-[14px] font-medium leading-tight tracking-tight break-all whitespace-pre-wrap line-clamp-2 ${isGroupExpanded ? 'text-white' : 'text-black'}`}>
                          {anchorMemo.text}
                        </span>
                      </div>
                      
                      {/* 기준 최신 메모 하단 날짜 + 삭제 버튼 */}
                      <div className={`text-[10px] font-medium tracking-wide relative z-10 text-left flex items-center gap-1 mt-0.5 ${isGroupExpanded ? 'text-white/80' : 'text-zinc-400'}`}>
                        <span>{formatDateTime(anchorMemo.created_at)}</span>
                        <span className={isGroupExpanded ? 'text-white/50' : 'text-zinc-300'}>|</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMemo(anchorMemo.id);
                          }}
                          className={`transition-colors ${isGroupExpanded ? 'hover:text-white' : 'hover:text-[#FF4D00]'}`}
                          aria-label="메모 삭제"
                        >
                          삭제
                        </button>
                      </div>

                      {/* SVG 기반 완벽한 꼬리 연결 (가장 하단의 최신 메모에만 항상 존재) */}
                      <div className="absolute top-[calc(100%-1.5px)] left-[12px] w-[12px] h-[8px] z-20 pointer-events-none overflow-visible">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1.5 0 H10.5 L6 6 Z" fill={isGroupExpanded ? "#FF4D00" : "white"} />
                          <path d="M1.5 1.5 L6 6.5 L10.5 1.5" stroke="#FF4D00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </CustomOverlayMap>
            );
          })
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
