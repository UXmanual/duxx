import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Map, CustomOverlayMap, MapMarker, MarkerClusterer, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Crosshair, MessageSquare, X, Coffee, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { starbucksReserveStores } from '../data/starbucksReserve';
import { AI_PERSONAS } from '../data/aiPersonas';
import Sidebar from '../components/Sidebar';
import confetti from 'canvas-confetti';

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
 * @version 34.3
 * @description 
 * - 선택 바블의 쉐도우 효과 개선 및 가독성 최적화 버전입니다. (v34.3)
 */

// 닉네임 조합용 상수
const PERSONALITIES = ["친절한", "배고픈", "심심한", "행복한", "궁금한", "신난", "차분한", "활발한", "꿈꾸는", "조용한", "똑똑한", "멋진", "귀여운", "용감한", "미스테리한", "발랄한"];
const SUFFIXES = ["바블러", "바블리", "바블몬", "바블링", "바블러브", "바블맨", "바블걸", "바블키즈", "바블마스터"];
const OLD_NEIGHBORHOODS = ["바블동네", "비밀동네", "우리동네", "이웃동네", "정겨운동네", "신비로운동네"];

const Main = () => {
  const { isDark } = useTheme();
  const [map, setMap] = useState(null);
  const [mapLevel, setMapLevel] = useState(4);
  const [myLocation, setMyLocation] = useState(null);
  
  // 메모 관련 상태
  const [memos, setMemos] = useState([]);
  const [isMemoMode, setIsMemoMode] = useState(false);
  const [expandedGroupIds, setExpandedGroupIds] = useState([]); 
  const [showReplyIds, setShowReplyIds] = useState([]); // 답글 펼침 상태 관리
  const [replyTargetId, setReplyTargetId] = useState(null); // 답글 작성 중인 메모 ID
  const [replyText, setReplyText] = useState(''); // 답글 입력 텍스트
  const [selectedMemoId, setSelectedMemoId] = useState(null); // LNB에 표시할 메모 ID

  const [starbucksPlaces, setStarbucksPlaces] = useState(starbucksReserveStores);
  const [isStarbucksVisible, setIsStarbucksVisible] = useState(true);
  const [selectedStarbucksId, setSelectedStarbucksId] = useState(null);

  // 초기 위치 로딩 최적화 상태
  const [isLocationLoaded, setIsLocationLoaded] = useState(false);
  const [initialCenter, setInitialCenter] = useState({ lat: 37.5665, lng: 126.9780 });

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAPS_API_KEY,
    libraries: ['services', 'clusterer', 'drawing'],
  });

  // 루트 메모 리스트 (터진 바블 30분 유지)
  const rootMemos = useMemo(() => {
    const now = new Date();
    return memos.filter(m => {
      if (m.parent_id) return false;
      if (m.popped_at) {
        const poppedTime = new Date(m.popped_at);
        const diffMinutes = (now - poppedTime) / (1000 * 60);
        return diffMinutes < 30;
      }
      return true;
    });
  }, [memos]);

  // 부드러운 오프셋 센터링을 위한 헬퍼 함수 (v32.8)
  const panToWithOffset = (lat, lng) => {
    if (!map) return;
    const latlng = new window.kakao.maps.LatLng(lat, lng);
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      const projection = map.getProjection();
      // 바텀시트 높이(약 45%)를 고려하여 마커를 화면 중상단(약 30~35% 지점)에 배치
      const offsetPixels = 160; 
      const markerPoint = projection.pointFromCoords(latlng);
      const newCenterPoint = new window.kakao.maps.Point(markerPoint.x, markerPoint.y + offsetPixels);
      const newCenterLatLng = projection.coordsFromPoint(newCenterPoint);
      map.panTo(newCenterLatLng);
    } else {
      map.panTo(latlng);
    }
  };

  const fetchMemos = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && data) setMemos(data);
    } catch (e) { console.warn('Supabase fetch failed:', e); }
  };

  const requestLocation = (shouldPan = true) => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
        setMyLocation(pos);
        if (map && shouldPan) panToWithOffset(pos.lat, pos.lng);
      },
      (err) => console.warn(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setMyLocation(coords);
          setInitialCenter(coords);
          setIsLocationLoaded(true);
        },
        () => setIsLocationLoaded(true),
        { timeout: 3000 }
      );
    } else {
      setIsLocationLoaded(true);
    }
    fetchMemos();
  }, []);

  // [중요] 만료된 바블 자동 삭제 로직 안정화 (v32.7)
  // 부작용을 방지하기 위해 렌더링 외부(setInterval)에서 ID를 식별한 후 상태 업데이트
  useEffect(() => {
    const reaper = setInterval(async () => {
      const now = new Date();
      const expiredItems = memos.filter(m => {
        if (!m.popped_at) return false;
        const poppedTime = new Date(m.popped_at);
        return (now - poppedTime) / (1000 * 60) >= 30;
      });

      if (expiredItems.length > 0) {
        const expiredIds = expiredItems.map(m => m.id);
        
        // 1. 선택된 메모가 만료된 경우 LNB 먼저 닫기
        if (expiredIds.includes(selectedMemoId)) {
          setSelectedMemoId(null);
        }

        // 2. 메모 상태 업데이트
        setMemos(prev => prev.filter(m => !expiredIds.includes(m.id)));

        // 3. DB 실제 삭제 (비동기)
        if (supabase) {
          try {
            await supabase.from('memos').delete().in('id', expiredIds);
          } catch (err) { console.error('DB Cleanup Error:', err); }
        }
      }
    }, 10000); 

    return () => clearInterval(reaper);
  }, [memos, selectedMemoId]);

  useEffect(() => {
    if (map) fetchMemos();
  }, [map]);

  const handleMyLocationBtn = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    requestLocation(true);
  };

  const handleReplySubmit = async (parentId) => {
    if (!replyText.trim()) return;
    const parentMemo = memos.find(m => m.id === parentId);
    if (!parentMemo) return;
    const neighborhood = parentMemo.nickname?.split(' ')[0] || "어딘가";
    const p = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
    const s = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    const nickname = `${neighborhood} ${p} ${s}`;
    const newReply = { lat: parentMemo.lat, lng: parentMemo.lng, text: replyText.trim(), nickname, parent_id: parentId, is_ai: false };
    try {
      const { data, error } = await supabase.from('memos').insert([newReply]).select();
      if (!error && data) {
        setMemos(prev => [...prev, data[0]]);
        setReplyText('');
        setReplyTargetId(null);
      }
    } catch (err) { console.error('Reply failed:', err); }
  };

  const triggerAIResponse = async (parentMemo) => {
    const delay = Math.floor(Math.random() * 3000) + 2000;
    setTimeout(async () => {
      const persona = AI_PERSONAS[Math.floor(Math.random() * AI_PERSONAS.length)];
      
      // 부모 메모의 지역명 추출 (v33.0: aiPersonas.js 데이터 정리로 로직 단순화)
      const neighborhood = parentMemo.nickname?.split(' ')[0] || "어딘가";
      const nickname = `${neighborhood} ${persona.name} ${persona.emoji}`.trim();
      
      const newReply = { 
        lat: parentMemo.lat, 
        lng: parentMemo.lng, 
        text: persona.styles[Math.floor(Math.random() * persona.styles.length)], 
        nickname: nickname, 
        parent_id: parentMemo.id, 
        is_ai: true, 
        persona_id: persona.id 
      };
      try {
        const { data, error } = await supabase.from('memos').insert([newReply]).select();
        if (!error && data) setMemos(prev => [...prev, data[0]]);
      } catch (err) { console.error('AI reply failed:', err); }
    }, delay);
  };

  const handleMapClick = async (_t, mouseEvent) => {
    if (!isMemoMode) return;
    const latlng = mouseEvent.latLng;
    const text = prompt('여기에 남길 메모를 입력해주세요:');
    if (text && text.trim()) {      
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2RegionCode(latlng.getLng(), latlng.getLat(), async (result, status) => {
        let neighborhood = "어딘가";
        if (status === window.kakao.maps.services.Status.OK) {
          const region = result.find(r => r.region_type === 'H') || result[0];
          neighborhood = region ? region.region_3depth_name : "어딘가";
        }
        const p = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
        const s = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
        const nickname = `${neighborhood} ${p} ${s}`;
        const newMemo = { lat: latlng.getLat(), lng: latlng.getLng(), text: text.trim(), nickname };
        try {
          const { data, error } = await supabase.from('memos').insert([newMemo]).select();
          if (!error && data) {
            setMemos(prev => [...prev, data[0]]);
            setIsMemoMode(false);
            triggerAIResponse(data[0]);
          }
        } catch (err) { console.error('Insert error:', err); }
      });
    }
  };

  const handleDeleteMemo = async (id) => {
    if (confirm('이 메모를 삭제하시겠습니까?')) {
      const { error } = await supabase.from('memos').delete().eq('id', id);
      if (!error) setMemos(prev => prev.filter(m => m.id !== id && m.parent_id !== id));
    }
  };

  const handlePopBubble = async (id, e) => {
    if (e) e.stopPropagation();
    
    // v34.2: DOM 요소를 직접 찾아 아이콘 위치를 100% 정확하게 타격
    const popElement = document.querySelector(`[data-pop-id="${id}"]`);
    let origin;

    if (popElement) {
      const rect = popElement.getBoundingClientRect();
      origin = {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      };
    } else {
      // 폴백: 요소를 찾지 못한 경우 (시야 밖 등) 계산식 활용
      const targetMemo = memos.find(m => m.id === id);
      if (targetMemo && map) {
        const projection = map.getProjection();
        const latlng = new window.kakao.maps.LatLng(targetMemo.lat, targetMemo.lng);
        const point = projection.pointFromCoords(latlng);
        const containerNode = map.getNode();
        const containerRect = containerNode.getBoundingClientRect();
        origin = {
          x: (containerRect.left + point.x) / window.innerWidth,
          y: (containerRect.top + point.y - 45) / window.innerHeight 
        };
      }
    }

    if (origin) {
      confetti({
        particleCount: 100,
        spread: 360,
        startVelocity: 45,
        gravity: 1.1,
        ticks: 80,
        origin: origin,
        colors: ['#FF4D00', '#FF8A00', '#FF1E00', '#FFF', '#FFE5D9'],
        shapes: ['circle'],
        scalar: 0.9,
        zIndex: 10005
      });
    }

    const now = new Date().toISOString();
    setMemos(prev => prev.map(m => m.id === id ? { ...m, popped_at: now, is_popping: true } : m));
    try {
      await supabase.from('memos').update({ popped_at: now }).eq('id', id);
    } catch (err) { console.error('Pop update failed:', err); }
    setTimeout(() => {
      setMemos(prev => prev.map(m => m.id === id ? { ...m, is_popping: false } : m));
    }, 1000);
  };

  if (loading || !isLocationLoaded) {
    return (
      <div className="w-full h-screen bg-white flex flex-col items-center justify-center pb-[20vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gray-200 rounded-full animate-ping opacity-40" />
            <div className="relative">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83a1 1 0 0 1 1.447.894v11.549a2 2 0 0 1-1.106 1.789l-4.553 2.276a2 2 0 0 1-1.788 0l-4.553-2.276a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 2 18.894V7.345a2 2 0 0 1 1.106-1.789l4.553-2.276a2 2 0 0 1 1.788 0l4.553 2.276Z" />
                <path d="M15 5.5v13" /><path d="M9 5.5v13" />
              </svg>
            </div>
          </div>
          <span className="text-[#9CA3AF] text-[15px] font-semibold animate-pulse">Loading Map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative bg-white overflow-hidden">
      <Map
        center={initialCenter}
        level={4}
        onCreate={m => { setMap(m); m.setMaxLevel(11); setMapLevel(m.getLevel()); setTimeout(() => m.relayout(), 100); }}
        onZoomChanged={m => setMapLevel(m.getLevel())}
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%' }}
      >
        {myLocation && (
          <CustomOverlayMap position={myLocation} zIndex={999} xAnchor={0.5} yAnchor={0.5}>
            <div className="relative flex items-center justify-center">
              <div className="absolute w-8 h-8 bg-[#FF4D00] rounded-full animate-ping opacity-30" />
              <div className="relative w-[24px] h-[24px] bg-[#FF4D00] border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                <div className="w-[6px] h-[6px] bg-white rounded-full" />
              </div>
            </div>
          </CustomOverlayMap>
        )}

        {isStarbucksVisible && starbucksPlaces.map(place => (
          <React.Fragment key={`sb-${place.id}`}>
            <MapMarker position={{ lat: place.lat, lng: place.lng }} 
              image={{ src: 'data:image/svg+xml;base64,' + btoa('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#00704a" stroke="white" stroke-width="2"/><path d="M12 6.25L13.5 10.75H18L14.5 13.25L15.5 17.75L12 15.25L8.5 17.75L9.5 13.25L6 10.75H10.5L12 6.25Z" fill="white"/></svg>'), size: { width: 24, height: 24 } }}
              onClick={() => { 
                panToWithOffset(place.lat, place.lng);
                setSelectedStarbucksId(selectedStarbucksId === place.id ? null : place.id); 
                if (selectedStarbucksId !== place.id) { setExpandedGroupIds([]); setSelectedMemoId(null); } 
              }}
            />
            {selectedStarbucksId === place.id && (
              <CustomOverlayMap 
                position={{ lat: place.lat, lng: place.lng }} 
                yAnchor={1.85} 
                zIndex={1000}
                clickable={true}
              >
                <div 
                  className="bg-white px-3 py-1.5 rounded-full border-2 border-[#00704a] shadow-lg flex items-center gap-1.5 relative select-none cursor-pointer animate-pop-in [touch-action:manipulation]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStarbucksId(null);
                  }}
                >
                  <span className="text-[13px] font-bold text-[#00704a] whitespace-nowrap">
                    {place.name}
                  </span>
                </div>
              </CustomOverlayMap>
            )}
          </React.Fragment>
        ))}

        {mapLevel >= 6 ? (
          <MarkerClusterer averageCenter={true} minLevel={6} minClusterSize={1} styles={[{ width: '32px', height: '32px', background: '#FF4D00', color: '#fff', textAlign: 'center', fontWeight: 'bold', lineHeight: '28px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', fontSize: '14px' }]}>
            {rootMemos.filter(m => !m.popped_at).map(memo => <MapMarker key={memo.id} position={{ lat: memo.lat, lng: memo.lng }} />)}
          </MarkerClusterer>
        ) : (
          rootMemos.map(memo => (
            <CustomOverlayMap key={`memo-${memo.id}`} position={{ lat: memo.lat, lng: memo.lng }} xAnchor={0} yAnchor={0} zIndex={replyTargetId === memo.id ? 999 : (memo.popped_at ? 1 : 10)}>
              <div className={`relative w-0 h-0 group pointer-events-none ${memo.is_popping ? 'animate-bubble-pop' : ''}`}>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-2 pointer-events-auto transition-opacity duration-500" style={{ opacity: memo.popped_at ? 0.4 : 1 }}>
                  {/* 터지는 쇼크웨이브 효과만 유지 (v34.1: 파편은 컨페티로 대체함) */}
                  {memo.is_popping && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1001]">
                      <div className="absolute w-12 h-12 border-4 border-[#FF4D00] rounded-full animate-shockwave" />
                    </div>
                  )}
                  <div className={`relative px-4 py-2 bg-white/90 backdrop-blur-md border-2 rounded-full shadow-lg flex items-center gap-2 min-w-[50px] max-w-[220px] cursor-pointer transition-all duration-300 ${memo.is_popping ? 'animate-bubble-pop' : ''} ${selectedMemoId === memo.id ? 'border-[#FF4D00] ring-4 ring-[#FF4D00]/30 z-[50] scale-105 shadow-[0_12px_32px_rgba(255,77,0,0.35)]' : 'border-[#FF4D00]'}`}
                    onClick={(e) => { 
                    e.stopPropagation(); 
                    panToWithOffset(memo.lat, memo.lng);
                    setSelectedStarbucksId(null); 
                    setSelectedMemoId(memo.id); 
                    setExpandedGroupIds([memo.id]); 
                    setShowReplyIds([memo.id]); 
                    setReplyTargetId(memo.id); 
                  }}
                >
                    {memos.filter(m => m.parent_id === memo.id).length > 0 && <div className="absolute -top-2 -right-2 bg-[#FF4D00] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white min-w-[20px] flex justify-center">{memos.filter(m => m.parent_id === memo.id).length}</div>}
                    <div className="flex-1 overflow-hidden font-bold text-[13px] truncate whitespace-nowrap">{memo.text}</div>
                    {!memo.popped_at && (
                      <button 
                        data-pop-id={memo.id}
                        onClick={(e) => handlePopBubble(memo.id, e)} 
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#FF4D00]/10 transition-colors"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4D00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><path d="M12 2v2M12 20v2M2 12h2M20 12h2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CustomOverlayMap>
          ))
        )}
      </Map>

      <Sidebar memo={memos.find(m => m.id === selectedMemoId)} replies={memos.filter(m => m.parent_id === selectedMemoId)} onClose={() => setSelectedMemoId(null)} onDelete={handleDeleteMemo} onReplySubmit={handleReplySubmit} onPop={handlePopBubble} replyText={replyText} setReplyText={setReplyText} formatDateTime={formatDateTime} />

      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
        <div className="flex flex-col items-center gap-3 pointer-events-auto">
          {isMemoMode && <div className="bg-[#FF4D00] text-white text-[12px] font-bold px-3 py-2 rounded-full mb-3">메모 위치를 눌러주세요</div>}
          <button onClick={() => setIsMemoMode(!isMemoMode)} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${isMemoMode ? 'bg-[#FF4D00] text-white' : 'bg-white text-[#FF4D00]'}`}><MessageSquare size={22} /></button>
          
          <button onClick={handleMyLocationBtn} className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-lg"><Crosshair size={22} /></button>
        </div>
      </div>

      <style>{`
        @keyframes pop-in { 0% { transform: scale(0.8) translateY(10px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        /* v33.7: 고도화된 터트리기 애니메이션 */
        @keyframes bubble-pop { 
          0% { transform: scale(1); filter: brightness(1.5); }
          10% { transform: scale(0.85); }
          30% { transform: scale(1.2); }
          100% { transform: scale(2.2); opacity: 0; filter: blur(8px); }
        }
        /* v33.7: 파편 효과 - 회전하며 사방으로 비산 */
        @keyframes burst-particle {
          0% { transform: rotate(var(--angle)) translateY(0) scale(var(--scale)); opacity: 1; }
          100% { transform: rotate(var(--angle)) translateY(calc(-1 * var(--dist))) scale(0); opacity: 0; }
        }
        /* v33.7: 쇼크웨이브 링 */
        @keyframes shockwave {
          0% { transform: scale(0.5); opacity: 1; border-width: 4px; }
          100% { transform: scale(3.5); opacity: 0; border-width: 0px; }
        }
        .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .animate-bubble-pop { animation: bubble-pop 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
        .animate-burst-particle { animation: burst-particle 0.7s cubic-bezier(0.1, 0.8, 0.3, 1) var(--delay) forwards; }
        .animate-shockwave { animation: shockwave 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Main;
