import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Map, CustomOverlayMap, MapMarker, MarkerClusterer, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { Crosshair, MessageSquare, X, Coffee } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { starbucksReserveStores } from '../data/starbucksReserve';

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
 * @version 21.2
 * @author Antigravity
 * @description 
 * - 바블 리스트 간격 복구 및 닉네임 하단 여백 최적화 버전입니다.
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
  const [expandedGroupIds, setExpandedGroupIds] = useState([]); // 그룹핑된 말풍선 확장 상태 추적

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
    if (!navigator.geolocation) return;

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const success = (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const pos = { lat, lng };
      
      setMyLocation(pos);
      
      if (map && shouldPan) {
        // 부드러운 이동 애니메이션 적용
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

  // 1. 컴포넌트 마운트 시 위치 미리 가져오기 (스켈레톤 노출용)
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
        () => {
          setIsLocationLoaded(true); // 실패 시 시청역 기반으로 로딩 해제
        },
        { timeout: 3000 } // 최대 3초만 대기
      );
    };

    prefetchLocation();
    fetchMemos();
  }, []);

  // 2. 지도 로드 후 데이터 재동기화
  useEffect(() => {
    if (map) {
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
      console.error('Supabase client is not initialized.');
      return;
    }

    const latlng = mouseEvent.latLng;
    const text = prompt('여기에 남길 메모를 입력해주세요:');
    
    if (text && text.trim()) {      
      // 1. 역지오코딩으로 동네 명칭 가져오기
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services || !window.kakao.maps.services.Geocoder) {
        alert('지도 서비스가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
        console.error('Kakao Maps Geocoder service is not available.');
        return;
      }

      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2RegionCode(latlng.getLng(), latlng.getLat(), async (result, status) => {
        let neighborhood = "어딘가";
        if (status === window.kakao.maps.services.Status.OK) {
          // 행정동(H) 명칭 우선 추출
          const region = result.find(r => r.region_type === 'H') || result[0];
          neighborhood = region ? region.region_3depth_name : "어딘가";
        } else {
          console.warn('Geocoder failed to find region code:', status);
        }

        // 2. 닉네임 생성: [동네] + [성격] + [접미사]
        const p = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
        const s = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
        const nickname = `${neighborhood} ${p} ${s}`;

        const newMemo = {
          lat: latlng.getLat(),
          lng: latlng.getLng(),
          text: text.trim(),
          nickname: nickname
        };

        try {
          const { data, error } = await supabase
            .from('memos')
            .insert([newMemo])
            .select();

          if (error) {
            console.error('Supabase insert error:', error);
            // 만약 nickname 컬럼이 없어서 실패하는 경우를 대비한 안내
            if (error.message.includes('column "nickname" of relation "memos" does not exist')) {
              alert('데이터베이스에 "nickname" 컬럼이 없습니다. Supabase SQL 에디터에서 다음 명령을 실행해주세요: \n\nALTER TABLE memos ADD COLUMN nickname TEXT;');
            } else {
              alert(`바블 등록 실패: ${error.message}`);
            }
            return;
          }

          if (data && data[0]) {
            setMemos(prev => [...prev, data[0]]);
            setIsMemoMode(false); // 작성 후 모드 해제
          }
        } catch (err) {
          console.error('Unexpected error during memo insertion:', err);
          alert('예기치 못한 오류가 발생했습니다.');
        }
      });
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
    setExpandedGroupIds(prev => {
      const isExpanding = !prev.includes(id);
      if (isExpanding) {
        setSelectedStarbucksId(null); 
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
            <div className={`relative flex items-center justify-center pointer-events-none select-none ${isDark ? 'custom-marker-original-color' : ''}`}>
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
                  {/* 말풍선 꼬리 */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#00704a]" />
                </div>
              </CustomOverlayMap>
            )}
          </React.Fragment>
        ))}

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
                zIndex={isGroupExpanded ? 999 : 10}
                clickable={true}
              >
                {/* 0x0 크기의 앵커 기준점 */}
                <div className="relative w-0 h-0 group animate-pop-in pointer-events-none">
                  {/* 기준(최신) 말풍선 Wrapper - 왼쪽 꼬리 정렬 복구 */}
                  <div className={`absolute bottom-0 left-[-18px] flex flex-col pb-[6px] pointer-events-auto ${isDark ? 'custom-marker-original-color' : ''}`}>
                    
                    <div 
                      className={`relative px-3 py-2 border-[1.5px] border-[#FF4D00] rounded-[8px] shadow-lg flex flex-col gap-1 w-max min-w-[120px] max-w-[240px] select-none ${hiddenCount > 0 ? 'cursor-pointer' : ''} ${isGroupExpanded ? 'bg-[#FF4D00]' : 'bg-white'} [touch-action:manipulation]`}
                      onClick={(e) => {
                        e.stopPropagation();
                        // 1. 클릭 시 지도를 해당 위치로 중앙 정렬 (스타벅스 마커와 동일한 동작)
                        if (map) {
                          map.panTo(new window.kakao.maps.LatLng(anchorMemo.lat, anchorMemo.lng));
                        }

                        // 2. 그룹 상태 및 스타벅스 선택 상태 처리
                        if (hiddenCount > 0) {
                          toggleGroupExpand(anchorMemo.id, e);
                        } else {
                          setSelectedStarbucksId(null); 
                        }
                      }}
                      onDoubleClick={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                    >
                      
                      {/* 펼쳐진 이전 메모들 (왼쪽 정렬 복구) */}
                      {hiddenCount > 0 && isGroupExpanded && (
                        <div 
                          className="absolute bottom-full left-[-1.5px] mb-[6px] flex flex-col items-start gap-[6px] cursor-default select-none [touch-action:manipulation]" 
                          onClick={(e) => e.stopPropagation()}
                          onDoubleClick={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                        >
                           {group.slice(0, hiddenCount).map(memo => (
                            <div key={memo.id} className="relative px-3 py-2 bg-white border-[1.5px] border-[#FF4D00] rounded-[8px] shadow-lg flex flex-col gap-1 w-max min-w-[120px] max-w-[240px] animate-pop-in">
                              {/* 닉네임 (동네+성격+접미사) */}
                              <div className="w-full text-left leading-none mb-0.5">
                                <span className="text-[11px] font-bold text-[#FF4D00] opacity-80 tracking-tight">
                                  {memo.nickname || getVirtualNickname(memo.id)}
                                </span>
                              </div>
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

                       {/* 닉네임 (동네+성격+접미사) */}
                      <div className="w-full text-left leading-none mb-0.5">
                        <span className={`text-[11px] font-bold tracking-tight ${isGroupExpanded ? 'text-white/70' : 'text-[#FF4D00] opacity-80'}`}>
                          {anchorMemo.nickname || getVirtualNickname(anchorMemo.id)}
                        </span>
                      </div>
                      
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

                      {/* SVG 기반 완벽한 꼬리 연결 (위치 추가 하향 조정) */}
                      <div className="absolute top-[calc(100%-0.2px)] left-[12px] w-[16px] h-[10px] z-20 pointer-events-none overflow-visible">
                        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 0 H14 L9.5 7.5 Q8 9 6.5 7.5 Z" fill={isGroupExpanded ? "#FF4D00" : "white"} />
                          <path d="M2 0 L6.5 7.5 Q8 9 9.5 7.5 L14 0" stroke="#FF4D00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
            className={`w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-all
              ${isDark 
                ? 'bg-[#1a1c1e]/90 text-white' 
                : 'bg-white text-[#1a1c1e]'}
            `}
            aria-label="현위치"
          >
            <Crosshair size={22} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <style>{`
        .kakao-dark-theme { 
          filter: invert(95%) hue-rotate(180deg) brightness(1.05) contrast(1.1) grayscale(0.1); 
          background-color: #1a1c1e !important; 
        }
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
        @keyframes btn-pulse-dark {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
          50% { box-shadow: 0 0 15px 2px rgba(255, 77, 0, 0.25); }
        }
        @keyframes btn-pulse-green {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 98, 65, 0); }
          50% { box-shadow: 0 0 15px 2px rgba(0, 98, 65, 0.4); }
        }
        .animate-btn-pulse-light { animation: btn-pulse-light 4s infinite ease-in-out; }
        .animate-btn-pulse-dark { animation: btn-pulse-dark 4s infinite ease-in-out; }
        .animate-btn-pulse-green { animation: btn-pulse-green 2s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default Main;
