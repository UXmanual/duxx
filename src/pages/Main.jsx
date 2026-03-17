import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Map, CustomOverlayMap, MapMarker, MarkerClusterer, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Crosshair, MessageSquare, X, Coffee, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { starbucksReserveStores } from '../data/starbucksReserve';
import { AI_PERSONAS } from '../data/aiPersonas';
import Sidebar from '../components/Sidebar';

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
 * @version 31.8
 * @author Antigravity
 * @description 
 * - 모바일 바텀시트 인풋 하단 절대 고정 및 조작성 최적화 버전입니다.
 */

// 닉네임 조합용 상수
const PERSONALITIES = ["친절한", "배고픈", "심심한", "행복한", "궁금한", "신난", "차분한", "활발한", "꿈꾸는", "조용한", "똑똑한", "멋진", "귀여운", "용감한", "미스테리한", "발랄한"];
const SUFFIXES = ["바블러", "바블리", "바블몬", "바블링", "바블러브", "바블맨", "바블걸", "바블키즈", "바블마스터"];
const OLD_NEIGHBORHOODS = ["바블동네", "비밀동네", "우리동네", "이웃동네", "정겨운동네", "신비로운동네"];

// 기존 글을 위한 결정론적 랜덤 닉네임 생성 함수
const getVirtualNickname = (id) => {
  if (!id) return "이름없는 바블러";
  // ID 문자열을 숫자로 변환하여 시드값 생성
  const seed = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const n = OLD_NEIGHBORHOODS[seed % OLD_NEIGHBORHOODS.length];
  const p = PERSONALITIES[(seed * 7) % PERSONALITIES.length];
  const s = SUFFIXES[(seed * 13) % SUFFIXES.length];
  return `${n} ${p} ${s}`;
};

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

  // 루트 메모 리스트 (터진 바블 30분 유지 & 애니메이션 대응) (v30.3)
  const rootMemos = useMemo(() => {
    const now = new Date();
    return memos.filter(m => {
      if (m.parent_id) return false;
      
      // 터진 바블(popped_at 존재)인 경우 30분이 지났는지 확인
      if (m.popped_at) {
        const poppedTime = new Date(m.popped_at);
        const diffMinutes = (now - poppedTime) / (1000 * 60);
        return diffMinutes < 30; // 30분 이내면 유지 (지도의 불투명도 로직으로 흐릿하게 표시됨)
      }
      
      return true;
    });
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
    if (!navigator.geolocation) return;
    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
    const success = (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const pos = { lat, lng };
      setMyLocation(pos);
      if (map && shouldPan) {
        map.panTo(new window.kakao.maps.LatLng(lat, lng));
      }
    };
    const error = (err) => {
      console.warn(`Geolocation error (${err.code}): ${err.message}`);
      if (err.code === 1 || err.code === 3) {
        navigator.geolocation.getCurrentPosition(success, null, {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: Infinity
        });
      }
    };
    navigator.geolocation.getCurrentPosition(success, error, options);
  };

  useEffect(() => {
    const prefetchLocation = () => {
      if (!navigator.geolocation) {
        setIsLocationLoaded(true);
        return;
      }
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
    };
    prefetchLocation();
    fetchMemos();
  }, []);

  useEffect(() => {
    if (map) fetchMemos();
  }, [map]);

  const handleMyLocationBtn = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    requestLocation(true);
  };

  // 답글 작성 핸들러
  const handleReplySubmit = async (parentId) => {
    if (!replyText.trim()) return;
    const parentMemo = memos.find(m => m.id === parentId);
    if (!parentMemo) return;

    const neighborhood = parentMemo.nickname?.split(' ')[0] || "어딘가";
    const p = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
    const s = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    const nickname = `${neighborhood} ${p} ${s}`;

    const newReply = {
      lat: parentMemo.lat,
      lng: parentMemo.lng,
      text: replyText.trim(),
      nickname: nickname,
      parent_id: parentId,
      is_ai: false
    };

    try {
      const { data, error } = await supabase.from('memos').insert([newReply]).select();
      if (!error && data) {
        setMemos(prev => [...prev, data[0]]);
        setReplyText('');
        setReplyTargetId(null);
      }
    } catch (err) { console.error('Reply failed:', err); }
  };

  // AI 자동 응답 트리거
  const triggerAIResponse = async (parentMemo) => {
    // 2~5초 사이 무작위 지연 (AI가 읽고 생각하는 척)
    const delay = Math.floor(Math.random() * 3000) + 2000;
    
    setTimeout(async () => {
      const persona = AI_PERSONAS[Math.floor(Math.random() * AI_PERSONAS.length)];
      const aiText = persona.styles[Math.floor(Math.random() * persona.styles.length)];
      
      const newReply = {
        lat: parentMemo.lat,
        lng: parentMemo.lng,
        text: aiText,
        nickname: `${persona.name} ${persona.emoji}`,
        parent_id: parentMemo.id,
        is_ai: true,
        persona_id: persona.id
      };

      try {
        const { data, error } = await supabase.from('memos').insert([newReply]).select();
        if (!error && data) {
          setMemos(prev => [...prev, data[0]]);
        }
      } catch (err) {
        console.error('AI reply failed:', err);
      }
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

        const newMemo = { lat: latlng.getLat(), lng: latlng.getLng(), text: text.trim(), nickname: nickname };
        try {
          const { data, error } = await supabase.from('memos').insert([newMemo]).select();
          if (!error && data) {
            setMemos(prev => [...prev, data[0]]);
            setIsMemoMode(false);
            // 사용자 메모 등록 후 AI 응답 트리거 작동
            triggerAIResponse(data[0]);
          }
        } catch (err) { console.error('Insert error:', err); }
      });
    }
  };

  const handleDeleteMemo = async (id) => {
    if (!supabase) return;
    if (confirm('이 메모를 삭제하시겠습니까?')) {
      const { error } = await supabase.from('memos').delete().eq('id', id);
      if (!error) {
        setMemos(prev => prev.filter(m => m.id !== id && m.parent_id !== id));
      }
    }
  };

  // 바블 터트리기 (Pop) 기능 (v28.0)
  const handlePopBubble = async (id, e) => {
    if (e) e.stopPropagation();
    const now = new Date().toISOString();
    
    // 1. 로컬 상태 즉시 업데이트 (애니메이션 필드 추가)
    setMemos(prev => prev.map(m => 
      m.id === id ? { ...m, popped_at: now, is_popping: true } : m
    ));

    // 2. DB 업데이트 (popped_at 컬럼 기록)
    try {
      await supabase.from('memos').update({ popped_at: now }).eq('id', id);
    } catch (err) {
      console.error('Pop update failed:', err);
    }

    // 3. 애니메이션 종료 후 상태 정리 (시각적 일관성 유지)
    setTimeout(() => {
      setMemos(prev => prev.map(m => 
        m.id === id ? { ...m, is_popping: false } : m
      ));
    }, 1000);
  };

  // 말풍선 그룹 확장 토글 처리
  const toggleGroupExpand = (id, e) => {
    e.stopPropagation();
    
    // 다른 바블을 누르면 기존 열려있던 답글 창/입력창 모두 닫기
    setShowReplyIds([]);
    setReplyTargetId(null);

    setExpandedGroupIds(prev => {
      const isExpanding = !prev.includes(id);
      if (isExpanding) {
        setSelectedStarbucksId(null); 
        setSelectedMemoId(id); // LNB 열기
        return [id];
      }
      return [];
    });
  };

  if (loading || !isLocationLoaded) {
    return (
      <div className="w-full h-screen bg-white relative overflow-hidden flex flex-col items-center justify-center pb-[20vh]">
        {/* 백그라운드 그리드 패턴 */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="w-full h-full border-t border-l border-black bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        
        {/* 중앙 로딩 요소 */}
        <div className="flex flex-col items-center gap-4 animate-pop-in">
          <div className="relative">
            {/* 파동 애니메이션 (연한 회색) */}
            <div className="absolute inset-0 bg-gray-200 rounded-full animate-ping opacity-40" />
            
            {/* 아이콘 컨테이너 (테두리 제거, 아이콘만 노출) */}
            <div className="relative flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83a1 1 0 0 1 1.447.894v11.549a2 2 0 0 1-1.106 1.789l-4.553 2.276a2 2 0 0 1-1.788 0l-4.553-2.276a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 2 18.894V7.345a2 2 0 0 1 1.106-1.789l4.553-2.276a2 2 0 0 1 1.788 0l4.553 2.276Z" />
                <path d="M15 5.5v13" />
                <path d="M9 5.5v13" />
              </svg>
            </div>
          </div>
          
          {/* 로딩 텍스트 (차분한 그레이, 프리텐다드) */}
          <div className="flex flex-col items-center gap-3">

            <span className="text-[#9CA3AF] text-[15px] font-semibold tracking-tight">
              Loading Map
            </span>
            <div className="w-24 h-[2px] bg-zinc-100 rounded-full overflow-hidden">
              <div className="w-full h-full bg-[#D1D5DB] origin-left animate-shimmer-progress" />
            </div>
          </div>
        </div>

        <style>{`
          @keyframes shimmer-progress {
            0% { transform: scaleX(0); }
            50% { transform: scaleX(0.7); }
            100% { transform: scaleX(1); }
          }
          .animate-shimmer-progress {
            animation: shimmer-progress 2.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative bg-white overflow-hidden">
      <Map
        center={initialCenter}
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
        className=""
      >
        {/* 현위치 마커 */}
        {myLocation && (
          <CustomOverlayMap 
            position={myLocation} 
            zIndex={999}
            xAnchor={0.5}
            yAnchor={0.5}
          >
            <div className="relative flex items-center justify-center pointer-events-none select-none">
              <div className="absolute w-8 h-8 bg-[#FF4D00] rounded-full animate-ping opacity-30" />
              <div className="relative w-[24px] h-[24px] bg-[#FF4D00] border-2 border-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                <div className="w-[6px] h-[6px] bg-white rounded-full" />
              </div>
            </div>
          </CustomOverlayMap>
        )}

        {/* 스타벅스 리저브 마커 레이어 */}
        {isStarbucksVisible && starbucksPlaces.map((place) => (
          <React.Fragment key={`starbucks-group-${place.id}`}>
            <MapMarker
              position={{ lat: place.lat, lng: place.lng }}
              image={{
                src: 'data:image/svg+xml;base64,' + btoa(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#00704a" stroke="white" stroke-width="2"/>
                    <path d="M12 6.25L13.5 10.75H18L14.5 13.25L15.5 17.75L12 15.25L8.5 17.75L9.5 13.25L6 10.75H10.5L12 6.25Z" fill="white"/>
                  </svg>
                `),
                size: { width: 24, height: 24 },
                options: { offset: { x: 12, y: 12 } }
              }}
              onClick={() => {
                if (map) {
                  map.panTo(new window.kakao.maps.LatLng(place.lat, place.lng));
                  const isOpening = selectedStarbucksId !== place.id;
                  if (isOpening) {
                    setExpandedGroupIds([]); // 스타벅스 말풍선 열 때 메모 말풍선 닫기
                    setShowReplyIds([]);    // 답글 창 닫기
                    setReplyTargetId(null); // 입력창 닫기
                  }
                  setSelectedStarbucksId(selectedStarbucksId === place.id ? null : place.id);
                }
              }}
            />
            {selectedStarbucksId === place.id && (
              <CustomOverlayMap 
                position={{ lat: place.lat, lng: place.lng }} 
                yAnchor={1.5} 
                zIndex={1000}
                clickable={true}
              >
                <div 
                  className="bg-white px-3 py-1.5 rounded-full border-2 border-[#00704a] shadow-lg flex items-center gap-1.5 relative select-none cursor-pointer animate-pop-in [touch-action:manipulation]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStarbucksId(null);
                  }}
                  onDoubleClick={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <span className="text-[13px] font-bold text-[#00704a] whitespace-nowrap">
                    {place.name}
                  </span>
                </div>
              </CustomOverlayMap>
            )}
          </React.Fragment>
        ))}

        {/* 지도 메모 표시 로직: 줌 레벨에 따른 동적 렌더링 (레벨 6 이상일 때 숫자 뱃지로 축약) */}
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
            {rootMemos.filter(m => !m.popped_at).map((memo) => (
              <MapMarker 
                key={memo.id} 
                position={{ lat: memo.lat, lng: memo.lng }} 
              />
            ))}
          </MarkerClusterer>
        ) : (
          rootMemos.map((memo) => (
            <CustomOverlayMap
              key={`memo-${memo.id}`}
              position={{ lat: memo.lat, lng: memo.lng }}
              xAnchor={0}
              yAnchor={0}
              zIndex={replyTargetId === memo.id ? 999 : (memo.popped_at ? 1 : 10)}
              clickable={true}
            >
              <div className={`relative w-0 h-0 group pointer-events-none ${memo.is_popping ? 'animate-bubble-pop' : 'animate-pop-in'}`}>
                {/* 화이트 글래스 캡슐 디자인 - v28.0 (오퍼시티 가변형) */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col pb-2 pointer-events-auto transition-opacity duration-500"
                     style={{ opacity: memo.popped_at ? 0.4 : 1 }}>
                  <div 
                    className={`relative px-4 py-2 bg-white/90 backdrop-blur-md border-2 border-[#FF4D00] rounded-full shadow-[0_8px_24px_rgba(255,77,0,0.12)] flex items-center gap-2 min-w-[50px] max-w-[220px] select-none transition-all duration-300 group/bubble ${!memo.popped_at ? 'hover:scale-105 hover:shadow-[0_12px_32px_rgba(255,77,0,0.2)]' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (map) map.panTo(new window.kakao.maps.LatLng(memo.lat, memo.lng));
                      setSelectedStarbucksId(null); 
                      setSelectedMemoId(memo.id); // LNB 열기
                      setExpandedGroupIds([memo.id]);
                      setShowReplyIds([memo.id]); 
                      setReplyTargetId(memo.id);
                    }}
                  >
                    {/* 답글 개수 배지 (v28.2 추가) */}
                    {memos.filter(m => m.parent_id === memo.id).length > 0 && (
                      <div className="absolute -top-2 -right-2 bg-[#FF4D00] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm z-20 border border-white flex items-center justify-center min-w-[20px]">
                        {memos.filter(m => m.parent_id === memo.id).length}
                      </div>
                    )}
                    {/* 텍스트 영역 - 무조건 1줄 제한 */}
                    <div className="flex-1 overflow-hidden">
                      <span className="text-[13px] font-bold leading-none tracking-tight whitespace-nowrap truncate text-[#1A1A1A] block">
                        {memo.text}
                      </span>
                    </div>

                    {/* 터트리기 아이콘 - 이미 터진 바블이 아닐 때만 노출 */}
                    {!memo.popped_at && (
                      <button
                        onClick={(e) => handlePopBubble(memo.id, e)}
                        className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-[#FF4D00]/10 transition-colors pointer-events-auto"
                        title="터트리기"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF4D00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41" />
                        </svg>
                      </button>
                    )}

                    {/* 터진 상태 표시 아이콘 */}
                    {memo.popped_at && (
                      <div className="flex-shrink-0 opacity-50">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </div>
                    )}

                    {/* 터질 때 사방으로 퍼지는 파편 효과 (애니메이션용) */}
                    {memo.is_popping && (
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                          <div 
                            key={i}
                            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[#FF4D00] rounded-full animate-burst-particle"
                            style={{ 
                              '--angle': `${i * 45}deg`,
                              '--delay': `${i * 0.05}s` 
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* [추후 LNB용] 데이터 보존 */}
                    <div className="hidden">
                      <span>{memo.nickname}</span>
                      <span>{formatDateTime(memo.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CustomOverlayMap>
          ))
        )}

      </Map>

      {/* LNB 사이드바 / 바텀시트 (v29.0) */}
      <Sidebar 
        memo={memos.find(m => m.id === selectedMemoId)}
        replies={memos.filter(m => m.parent_id === selectedMemoId)}
        onClose={() => setSelectedMemoId(null)}
        onDelete={handleDeleteMemo}
        onReplySubmit={handleReplySubmit}
        onPop={handlePopBubble}
        replyText={replyText}
        setReplyText={setReplyText}
        formatDateTime={formatDateTime}
      />

      {/* [Interface Layer] 우측 컨트롤 스택 */}
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
        <div className="flex flex-col items-center justify-end gap-3 pointer-events-auto">
          {/* 메모 작성 안내 말풍선 */}
          {isMemoMode && (
            <div className="absolute bottom-[calc(100%+12px)] right-0 animate-pop-in pointer-events-none">
              <div className="bg-[#FF4D00] text-white text-[12px] font-bold px-3 py-2 rounded-full whitespace-nowrap relative">
                메모를 남길 위치를 눌러주세요
                {/* 말풍선 꼬리 */}
                <div className="absolute top-full right-[18px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#FF4D00]" />
              </div>
            </div>
          )}

          {/* 메모 작성 모드 버튼 */}
          <button 
            onClick={() => setIsMemoMode(!isMemoMode)}
            className={`w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-all relative
              ${isMemoMode 
                ? 'bg-[#FF4D00] text-white' 
                : (isDark 
                  ? 'bg-[#1a1c1e]/90 text-[#FF4D00] animate-btn-pulse-dark' 
                  : 'bg-white text-[#FF4D00] animate-btn-pulse-light')}
            `}
            aria-label="메모 작성 모드"
          >
            <MessageSquare 
              size={22} 
              fill={isMemoMode ? "currentColor" : "none"} 
              className={!isMemoMode ? "animate-memo-icon" : ""}
            />
          </button>

          {/* 현위치 버튼 */}
          <button 
            onPointerDown={handleMyLocationBtn}
            className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-all bg-white text-[#1a1c1e]"
            aria-label="현위치"
          >
            <Crosshair size={22} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <style>{`

        @keyframes pop-in {
          0% { transform: scale(0.8) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-pop-in {
          animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        /* 바블 터트리기 애니메이션 (v28.0) */
        @keyframes bubble-pop {
          0% { transform: scale(1); filter: brightness(1.2); }
          20% { transform: scale(1.1); }
          50% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-bubble-pop {
          animation: bubble-pop 0.5s ease-out forwards;
        }

        /* 파편 사방으로 퍼지는 효과 */
        @keyframes burst-particle {
          0% { transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-40px) scale(0); opacity: 0; }
        }
        .animate-burst-particle {
          animation: burst-particle 0.6s ease-out var(--delay) forwards;
        }

        .animate-memo-icon {
          animation: memo-wiggle 3s infinite ease-in-out;
          -webkit-animation: memo-wiggle 3s infinite ease-in-out;
        }
        .animate-memo-icon path {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: memo-draw 2.5s infinite linear;
          -webkit-animation: memo-draw 2.5s infinite linear;
          stroke-linecap: round;
          stroke-linejoin: round;
          will-change: stroke-dashoffset;
        }
        @keyframes memo-wiggle {
          0%, 85%, 100% { transform: scale(1) rotate(0); -webkit-transform: scale(1) rotate(0); }
          90% { transform: scale(1.1) rotate(5deg); -webkit-transform: scale(1.1) rotate(5deg); }
          95% { transform: scale(1.1) rotate(-5deg); -webkit-transform: scale(1.1) rotate(-5deg); }
        }
        @-webkit-keyframes memo-wiggle {
          0%, 85%, 100% { -webkit-transform: scale(1) rotate(0); }
          90% { -webkit-transform: scale(1.1) rotate(5deg); }
          95% { -webkit-transform: scale(1.1) rotate(-5deg); }
        }
        @keyframes memo-draw {
          0% { stroke-dashoffset: 300; }
          40% { stroke-dashoffset: 200; }
          60% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 100; }
        }
        @-webkit-keyframes memo-draw {
          0% { stroke-dashoffset: 300; }
          40% { stroke-dashoffset: 200; }
          60% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 100; }
        }
        @keyframes btn-pulse-light {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.05); }
          50% { box-shadow: 0 0 15px 2px rgba(255, 77, 0, 0.15); }
        }
        @keyframes btn-pulse-green {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 98, 65, 0); }
          50% { box-shadow: 0 0 15px 2px rgba(0, 98, 65, 0.4); }
        }
        .animate-btn-pulse-light { animation: btn-pulse-light 4s infinite ease-in-out; }
        .animate-btn-pulse-green { animation: btn-pulse-green 2s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default Main;
