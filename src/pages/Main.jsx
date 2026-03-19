import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Map, CustomOverlayMap, MapMarker, MarkerClusterer, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, MessageSquare, X, Coffee, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { starbucksReserveStores } from '../data/starbucksReserve';
import { AI_PERSONAS } from '../data/aiPersonas';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SubwaySidebar from '../components/SubwaySidebar';
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
 * @version 43.0
 * @description 
 * - 지하철 도착 정보 정렬 로직 강화 및 이번열차/다음열차 구분 (v41.1)
 * - 커스텀 메모 폼 복구 및 사이드바 노출 정상화 (v36.7)
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
  const [writingMemoCoords, setWritingMemoCoords] = useState(null); // 메모 작성 중인 좌표
  const [newMemoText, setNewMemoText] = useState(''); // 새 메모 입력 텍스트

  const [starbucksPlaces, setStarbucksPlaces] = useState(starbucksReserveStores);
  const [isStarbucksVisible, setIsStarbucksVisible] = useState(true);
  const [selectedStarbucksId, setSelectedStarbucksId] = useState(null);
  const [selectedSubwayArrivals, setSelectedSubwayArrivals] = useState(null);
  const [subwayFetchTime, setSubwayFetchTime] = useState(null);
  const seoulStationCoords = { lat: 37.554648, lng: 126.972559 };

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

  // 부드러운 오프셋 센터링을 위한 헬퍼 함수
  const panToWithOffset = (lat, lng) => {
    if (!map) return;
    const latlng = new window.kakao.maps.LatLng(lat, lng);
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      const projection = map.getProjection();
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
        if (expiredIds.includes(selectedMemoId)) setSelectedMemoId(null);
        setMemos(prev => prev.filter(m => !expiredIds.includes(m.id)));
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

  // 지능형 줌 대응: 6레벨 이상일 때 지하철 바블 자동 닫기 (v40.2)
  useEffect(() => {
    if (mapLevel >= 6 && selectedSubwayArrivals) {
      setSelectedSubwayArrivals(null);
    }
  }, [mapLevel, selectedSubwayArrivals]);

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
    // 1-3개의 답글 랜덤 결정
    const replyCount = Math.floor(Math.random() * 3) + 1;
    
    // 0-60초 사이의 랜덤 지연 시간들 생성
    for (let i = 0; i < replyCount; i++) {
      const delay = Math.floor(Math.random() * 60000);
      
      setTimeout(async () => {
        // 1. 컨텍스트 분석 (시간대)
        const hour = new Date().getHours();
        let timeKey = 'night';
        if (hour >= 6 && hour < 11) timeKey = 'morning';
        else if (hour >= 11 && hour < 17) timeKey = 'afternoon';
        else if (hour >= 17 && hour < 22) timeKey = 'evening';

        // 2. 컨텍스트 분석 (날씨) - Open-Meteo API 요청 (v38.1)
        let weatherKey = 'sunny';
        try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${parentMemo.lat}&longitude=${parentMemo.lng}&current_weather=true`);
          const data = await res.json();
          const code = data.current_weather.weathercode;
          if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) weatherKey = 'rainy';
          else if ([71, 73, 75, 77, 85, 86].includes(code)) weatherKey = 'snowy';
          else if ([1, 2, 3, 45, 48].includes(code)) weatherKey = 'cloudy';
        } catch (e) { console.warn('Weather fetch for AI failed:', e); }

        // 3. 적절한 페르소나 선택
        const persona = AI_PERSONAS[Math.floor(Math.random() * AI_PERSONAS.length)];
        
        // 4. 스마트 답글 로직 (우선순위: 키워드 > 날씨 > 시간대 > 기본 스타일)
        let replyContent = "";
        const userText = parentMemo.text || "";
        const matchedKeyword = Object.keys(persona.keywordMapper).find(key => userText.includes(key));
        
        if (matchedKeyword) {
          replyContent = persona.keywordMapper[matchedKeyword];
        } else if (Math.random() > 0.5) {
          replyContent = persona.weatherContext[weatherKey];
        } else if (Math.random() > 0.3) {
          replyContent = persona.timeContext[timeKey];
        } else {
          replyContent = persona.styles[Math.floor(Math.random() * persona.styles.length)];
        }

        // 5. 닉네임 생성
        const neighborhood = parentMemo.nickname?.split(' ')[0] || "어딘가";
        const nickname = `${neighborhood} ${persona.name} ${persona.emoji}`.trim();
        
        const newReply = { 
          lat: parentMemo.lat, 
          lng: parentMemo.lng, 
          text: replyContent, 
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
    }
  };

  const handleMapClick = async (_t, mouseEvent) => {
    if (!isMemoMode) return;
    setWritingMemoCoords({
      lat: mouseEvent.latLng.getLat(),
      lng: mouseEvent.latLng.getLng()
    });
  };
  const fetchSubwayArrivals = async () => {
    // 이미 로딩 중이거나 데이터가 있으면 중복 호출 방지 (v40.3)
    if (selectedSubwayArrivals) return;
    
    setSelectedSubwayArrivals({ loading: true });
    setSelectedMemoId(null); // 메모 LNB 닫기
    panToWithOffset(seoulStationCoords.lat, seoulStationCoords.lng);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setSubwayFetchTime(timeStr);

    try {
      const res = await fetch(`/api/subway`);
      const data = await res.json();
      
      if (data.realtimeArrivalList && data.realtimeArrivalList.length > 0) {
        // 1호선 서울역 데이터만 필터링 (subwayId "1001")
        const line1All = data.realtimeArrivalList.filter(item => item.subwayId === "1001");
        
        // 정렬 기준: barvlDt(도착예측시간) 기준 오름차순
        // 만약 barvlDt가 0이거나 데이터가 불확실하면 arvlCd(도착코드) 등을 참고할 수 있으나, 
        // 일반적으로 barvlDt가 가장 정확한 우선순위를 제공함
        const upTrains = line1All
          .filter(item => item.updnLine === "상행")
          .sort((a, b) => parseInt(a.barvlDt) - parseInt(b.barvlDt))
          .slice(0, 2);
          
        const downTrains = line1All
          .filter(item => item.updnLine === "하행")
          .sort((a, b) => parseInt(a.barvlDt) - parseInt(b.barvlDt))
          .slice(0, 2);
        
        const parseSubwayInfo = (train, idx) => {
          if (!train) return null;
          const [dest, dir] = train.trainLineNm.split(" - ");
          // '서울' 문구를 '당역'으로 치환 (v40.0)
          const statusMsg = train.arvlMsg2.replace(/서울/g, "당역");
          
          return {
            dest: dest,
            direction: dir ? `(${dir})` : "",
            status: statusMsg,
            // 0번째는 이번열차, 1번째는 다음열차로 표기 (v41.1)
            arrivalType: idx === 0 ? "이번열차" : "다음열차",
            time: (train.barvlDt && train.barvlDt !== "0") ? `${Math.floor(train.barvlDt / 60)}분 ${train.barvlDt % 60}초 후 도착` : ""
          };
        };

        // 그룹화된 데이터로 저장 (v41.1)
        setSelectedSubwayArrivals({
          up: upTrains.map((t, i) => parseSubwayInfo(t, i)),
          down: downTrains.map((t, i) => parseSubwayInfo(t, i))
        });
      } else {
        setSelectedSubwayArrivals({ up: [], down: [], error: "현재 운행 정보가 없습니다." });
      }
    } catch (e) {
      console.error('Subway API Error:', e);
      setSelectedSubwayArrivals({ up: [], down: [], error: "데이터 오류" });
    }
  };

  const submitNewMemo = async () => {
    if (!newMemoText.trim() || !writingMemoCoords) return;
    
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2RegionCode(writingMemoCoords.lng, writingMemoCoords.lat, async (result, status) => {
      let neighborhood = "어딘가";
      if (status === window.kakao.maps.services.Status.OK) {
        const region = result.find(r => r.region_type === 'H') || result[0];
        neighborhood = region ? region.region_3depth_name : "어딘가";
      }
      const p = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
      const s = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
      const nickname = `${neighborhood} ${p} ${s}`;
      const newMemo = { lat: writingMemoCoords.lat, lng: writingMemoCoords.lng, text: newMemoText.trim(), nickname };
      
      try {
        const { data, error } = await supabase.from('memos').insert([newMemo]).select();
        if (!error && data) {
          const createdMemo = { ...data[0], is_new: true };
          setMemos(prev => [...prev, createdMemo]);
          
          // 새 바블 위치로 지도 중심 이동 (v38.6)
          panToWithOffset(data[0].lat, data[0].lng);
          
          setWritingMemoCoords(null);
          setNewMemoText('');
          setIsMemoMode(false);
          triggerAIResponse(data[0]);
          
          // 2초 후 is_new 플래그 제거하여 애니메이션 종료
          setTimeout(() => {
            setMemos(prev => prev.map(m => m.id === data[0].id ? { ...m, is_new: false } : m));
          }, 2000);
        }
      } catch (err) { console.error('Insert error:', err); }
    });
  };

  const handleDeleteMemo = async (id) => {
    if (confirm('이 메모를 삭제하시겠습니까?')) {
      const { error } = await supabase.from('memos').delete().eq('id', id);
      if (!error) setMemos(prev => prev.filter(m => m.id !== id && m.parent_id !== id));
    }
  };

  const handlePopBubble = async (id, e) => {
    if (e) e.stopPropagation();
    const popElement = document.querySelector(`[data-pop-id="${id}"]`);
    let origin;

    if (popElement) {
      const rect = popElement.getBoundingClientRect();
      origin = {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      };
    } else {
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
      <div className="w-full h-[100dvh] bg-white flex flex-col items-center justify-center pb-[20vh]">
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
    <div className="fixed inset-0 w-full h-[100dvh] overflow-visible font-sans antialiased bg-transparent z-0">
      <Map
        center={initialCenter}
        level={4}
        onCreate={m => { setMap(m); m.setMaxLevel(11); m.relayout(); setTimeout(() => m.relayout(), 300); }}
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

        {/* 1호선 서울역 특별 마커 (v41.0 - LNB 통합) */}
        <MapMarker 
          position={seoulStationCoords}
          image={{ 
            src: 'data:image/svg+xml;base64,' + btoa(`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#3D53B3" stroke="white" stroke-width="2.5"/><path d="M10 12C10 10.8954 10.8954 10 12 10H20C21.1046 10 22 10.8954 22 12V20C22 21.1046 21.1046 22 20 22H12C10.8954 22 10 21.1046 10 20V12Z" fill="white"/><path d="M13 13H19V17H13V13Z" fill="#3D53B3"/><circle cx="13" cy="20" r="1.2" fill="#3D53B3"/><circle cx="19" cy="20" r="1.2" fill="#3D53B3"/></svg>`), 
            size: { width: 32, height: 32 },
            offset: { x: 16, y: 16 }
          }}
          onClick={fetchSubwayArrivals}
          zIndex={100}
        />

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
                  {memo.is_popping && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1001]">
                      <div className="absolute w-12 h-12 border-4 border-[#FF4D00] rounded-full animate-shockwave" />
                    </div>
                  )}
                  <div className={`relative px-4 py-2 bg-white/90 backdrop-blur-md border-2 rounded-full flex items-center gap-2 min-w-[50px] max-w-[220px] cursor-pointer transition-all duration-300 ${memo.is_new ? 'animate-bubble-spawn shadow-[0_0_20px_rgba(255,77,0,0.5)]' : ''} ${memo.is_popping ? 'animate-bubble-pop' : ''} ${selectedMemoId === memo.id ? 'border-[#FF4D00] z-[50] scale-105 shadow-[0_15px_45px_rgba(255,77,0,0.25)]' : 'border-[#FF4D00] shadow-lg'}`}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      panToWithOffset(memo.lat, memo.lng);
                      setSelectedStarbucksId(null); 
                      setSelectedSubwayArrivals(null); // 지하철 LNB 닫기
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

      {/* 통합 메모 작성 폼 (v36.7 복구 버전) */}
      <AnimatePresence>
        {writingMemoCoords && (
          <div className="fixed inset-0 z-[10001] flex items-start justify-center p-6 pt-[12vh] pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[400px] bg-white/80 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_30px_60px_rgba(255,77,0,0.15)] pointer-events-auto border border-white"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[18px] font-black text-gray-900 tracking-tight">여기에 바블하기</h3>
                <button 
                  onClick={() => { setWritingMemoCoords(null); setNewMemoText(''); setIsMemoMode(false); }}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                >
                  <X size={18} />
                </button>
              </div>
              
              <textarea
                autoFocus
                value={newMemoText}
                onChange={(e) => setNewMemoText(e.target.value)}
                placeholder="어떤 이야기를 남길까요?"
                className="w-full h-24 bg-white/50 rounded-2xl p-4 text-[15px] font-medium border border-gray-100 focus:border-[#FF4D00] focus:ring-4 focus:ring-[#FF4D00]/10 focus:outline-none transition-all resize-none mb-6 placeholder:text-gray-400"
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => { setWritingMemoCoords(null); setNewMemoText(''); setIsMemoMode(false); }}
                  className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold text-[15px]"
                >
                  취소
                </button>
                <button 
                  onClick={submitNewMemo}
                  disabled={!newMemoText.trim()}
                  className="flex-[2] py-4 rounded-2xl bg-[#FF4D00] text-white font-bold text-[15px] shadow-[0_10px_20px_rgba(255,77,0,0.2)] disabled:opacity-50"
                >
                  바블 남기기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* [Layer 2] UI Layer (Header & Footer) */}
      <div className="pointer-events-none fixed inset-0 z-40 overflow-visible">
        <Header />
        <Footer />
      </div>

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

      <div className="pointer-events-none fixed inset-0 z-40 overflow-visible">
        <Header />
        <Footer />
      </div>

      <div className="fixed bottom-10 right-8 z-[9999] pointer-events-none">
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <AnimatePresence>
            {isMemoMode && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                className="bg-[#FF4D00] text-white text-[13px] font-black px-4 py-2.5 rounded-2xl mb-1 mr-0 border border-[#FF4D00]"
              >
                메모 위치를 눌러주세요
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-3">
            <motion.button 
              onClick={() => setIsMemoMode(!isMemoMode)}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`w-16 h-16 rounded-[22px] flex items-center justify-center transition-all backdrop-blur-md ${isMemoMode ? 'bg-[#FF4D00] text-white shadow-lg' : 'bg-white/80 text-[#FF4D00]'}`}
            >
              {isMemoMode ? (
                <X size={28} strokeWidth={2.5} />
              ) : (
                <motion.div
                  animate={{ y: [0, -3, 0], rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MessageSquare size={28} strokeWidth={2.5} fill="none" />
                </motion.div>
              )}
            </motion.button>
            <motion.button 
              onClick={handleMyLocationBtn}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 rounded-[22px] flex items-center justify-center bg-white/80 text-gray-800 backdrop-blur-md active:bg-white transition-all h-16"
            >
              <Crosshair size={26} strokeWidth={2.5} className="text-[#FF4D00]" />
            </motion.button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bubble-spawn { 
          0% { transform: scale(0); opacity: 0; filter: brightness(2); }
          60% { transform: scale(1.1); opacity: 1; filter: brightness(1.2); }
          100% { transform: scale(1); opacity: 1; filter: brightness(1); }
        }
        @keyframes pop-in { 0% { transform: scale(0.8) translateY(10px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes bubble-pop { 0% { transform: scale(1); filter: brightness(1.5); } 10% { transform: scale(0.85); } 30% { transform: scale(1.2); } 100% { transform: scale(2.2); opacity: 0; filter: blur(8px); } }
        @keyframes shockwave { 0% { transform: scale(0.5); opacity: 1; border-width: 4px; } 100% { transform: scale(3.5); opacity: 0; border-width: 0px; } }
        .animate-bubble-spawn { animation: bubble-spawn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .animate-bubble-pop { animation: bubble-pop 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
        .animate-shockwave { animation: shockwave 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Main;
