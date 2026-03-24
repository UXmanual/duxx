import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Map, CustomOverlayMap, MapMarker, MarkerClusterer, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, MessageSquare, X, Coffee, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { starbucksReserveStores } from '../data/starbucksReserve';
import { AI_PERSONAS } from '../data/aiPersonas';
import { SEOUL_STATION_TIMETABLE_STATIC } from '../data/subwayTimetable';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SubwaySidebar from '../components/SubwaySidebar';
import FlowerMarketSheet from '../components/FlowerMarketSheet';
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

const toRadians = (value) => (value * Math.PI) / 180;

const calculateDistanceMeters = (from, to) => {
  if (!from || !to) return Number.POSITIVE_INFINITY;

  const earthRadius = 6371000;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

/**
 * [Page] 硫붿씤 ?섏씠吏 (吏??硫붾え 湲곕뒫 ?듯빀 踰꾩쟾)
 * @version 43.3
 * @description 
 * - 吏?섏쿋 ?꾩갑 ?뺣낫 ?뺣젹 濡쒖쭅 媛뺥솕 諛??대쾲?댁감/?ㅼ쓬?댁감 援щ텇 (v41.1)
 * - 而ㅼ뒪? 硫붾え ??蹂듦뎄 諛??ъ씠?쒕컮 ?몄텧 ?뺤긽??(v36.7)
 */

// ?됰꽕??議고빀???곸닔
const PERSONALITIES = [
  '\uCE5C\uC808\uD55C',
  '\uBC18\uAC00\uC6B4',
  '\uC218\uB2E4\uC2A4\uB7EC\uC6B4',
  '\uD589\uBCF5\uD55C',
  '\uAD81\uAE08\uD55C',
  '\uC194\uC9C1\uD55C',
  '\uCC28\uBD84\uD55C',
  '\uD65C\uBC1C\uD55C',
  '\uC6A9\uAC10\uD55C',
  '\uC870\uC6A9\uD55C',
  '\uC124\uB808\uB294',
  '\uBA4B\uC9C4',
  '\uADC0\uC5EC\uC6B4',
  '\uC720\uCF8C\uD55C',
  '\uC2E0\uAE30\uD55C',
  '\uBC1C\uB784\uD55C'
];
const SUFFIXES = [
  '\uBC14\uBE14',
  '\uBC14\uBE14\uB7EC',
  '\uBC14\uBE14\uB9C1',
  '\uBC14\uBE14\uBAA8\uC5B8',
  '\uBC14\uBE14\uD53C\uD50C',
  '\uBC14\uBE14\uD504\uB80C\uC988',
  '\uBC14\uBE14\uD06C\uB8E8',
  '\uBC14\uBE14\uD329\uD1A0\uB9AC',
  '\uBC14\uBE14\uB77C\uC6B4\uC9C0'
];
const OLD_NEIGHBORHOODS = [
  '\uBC14\uBE14\uB3D9\uB124',
  '\uBE44\uBC00\uB3D9\uB124',
  '\uC6B0\uB9AC\uB3D9\uB124',
  '\uC774\uC6C3\uB3D9\uB124',
  '\uC815\uACA8\uC6B4\uB3D9\uB124',
  '\uC2E0\uBE44\uB85C\uC6B4\uB3D9\uB124'
];

const Main = () => {
  const { isDark } = useTheme();
  const [map, setMap] = useState(null);
  const [mapLevel, setMapLevel] = useState(4);
  const [myLocation, setMyLocation] = useState(null);
  
  // 硫붾え 愿???곹깭
  const [memos, setMemos] = useState([]);
  const [isMemoMode, setIsMemoMode] = useState(false);
  const [expandedGroupIds, setExpandedGroupIds] = useState([]); 
  const [showReplyIds, setShowReplyIds] = useState([]); // ?듦? ?쇱묠 ?곹깭 愿由?
  const [replyTargetId, setReplyTargetId] = useState(null); // ?듦? ?묒꽦 以묒씤 硫붾え ID
  const [replyText, setReplyText] = useState(''); // ?듦? ?낅젰 ?띿뒪??
  const [selectedMemoId, setSelectedMemoId] = useState(null); // LNB???쒖떆??硫붾え ID
  const [writingMemoCoords, setWritingMemoCoords] = useState(null); // 硫붾え ?묒꽦 以묒씤 醫뚰몴
  const [newMemoText, setNewMemoText] = useState(''); // ??硫붾え ?낅젰 ?띿뒪??

  const [isSubmittingMemo, setIsSubmittingMemo] = useState(false);
  const [starbucksPlaces, setStarbucksPlaces] = useState(starbucksReserveStores);
  const [isStarbucksVisible, setIsStarbucksVisible] = useState(true);
  const [selectedStarbucksId, setSelectedStarbucksId] = useState(null);
  const [isYangjaeFlowerMarketSelected, setIsYangjaeFlowerMarketSelected] = useState(false);
  const [isFlowerMarketSheetOpen, setIsFlowerMarketSheetOpen] = useState(false);
  const [selectedSubwayArrivals, setSelectedSubwayArrivals] = useState(null);
  const [selectedBusStop, setSelectedBusStop] = useState(null);
  const [selectedCurrentLocationInfo, setSelectedCurrentLocationInfo] = useState(null);
  const [activeBusStopConfig, setActiveBusStopConfig] = useState(null);
  const [subwayFetchTime, setSubwayFetchTime] = useState(null);
  const busRequestIdRef = useRef(0);
  const currentLocationRequestIdRef = useRef(0);
  const seoulStationCoords = { lat: 37.554648, lng: 126.972559 };
  const gyeonggiBusStop = {
    provider: 'gyeonggi',
    stationNumber: '14156',
    coords: { lat: 37.4675333, lng: 126.8756167 },
    fallbackStation: {
      id: 213000090,
      mobileNo: '14156',
      name: '\uD558\uC548\uC8FC\uACF52.9\uB2E8\uC9C0\uC55E',
      regionName: '\uAD11\uBA85'
    }
  };
  const seoulBusStop = {
    provider: 'seoul',
    stationNumber: '18-643',
    coords: { lat: 37.466408, lng: 126.887668 },
    fallbackStation: {
      id: '117000181',
      mobileNo: '18-643',
      name: '\uB3C5\uC0B0\uC5ED2\uBC88\uCD9C\uAD6C',
      regionName: '\uC11C\uC6B8'
    }
  };
  const haanBusStopCoords = gyeonggiBusStop.coords;
  const citizenGymBusStop = {
    provider: 'gyeonggi',
    stationNumber: '14141',
    coords: { lat: 37.463746, lng: 126.871174 },
    fallbackStation: {
      id: 213000119,
      mobileNo: '14141',
      name: '\uAD11\uBA85\uC2DC\uBBFC\uCCB4\uC721\uAD00',
      regionName: '\uAD11\uBA85'
    }
  };
  const yangjaeFlowerMarketCoords = { lat: 37.467715, lng: 127.039455 };
  const yangjaeFlowerMarketName = '\uC591\uC7AC\uAF43\uC2DC\uC7A5';
  const yangjaeFlowerMarketInfo = {
    name: yangjaeFlowerMarketName,
    address: '\uC11C\uC6B8 \uC11C\uCD08\uAD6C \uAC15\uB0A8\uB300\uB85C 27 aT\uC13C\uD130 \uD654\uD6FC\uACF5\uD310\uC7A5',
    access: [
      '\uC2E0\uBD84\uB2F9\uC120 \uC591\uC7AC\uC2DC\uBBFC\uC758\uC232\uC5ED 4\uBC88 \uCD9C\uAD6C\uC5D0\uC11C \uB3C4\uBCF4\uB85C \uC774\uB3D9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
      'aT\uC13C\uD130 \uD654\uD6FC\uACF5\uD310\uC7A5 \uBC29\uD5A5\uC73C\uB85C \uC9C4\uC785\uD558\uBA74 \uB429\uB2C8\uB2E4.'
    ],
    hours: [
      '\uC808\uD654 \uB9E4\uC7A5: 01:00~15:00',
      '\uB09C \uB9E4\uC7A5: 07:00~19:00',
      '\uAD00\uC5FD \uB9E4\uC7A5: 06:00~20:00',
      '\uC18C\uB9E4 \uB9E4\uC7A5: 07:00~19:00'
    ],
    phone: '02-579-3417',
    amenities: [
      '\uB9E4\uC7A5\uBCC4 \uC6B4\uC601 \uC2DC\uAC04\uC774 \uC870\uAE08\uC529 \uB2E4\uB97C \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
      '\uC77C\uBD80 \uC810\uD3EC\uB294 \uC0C8\uBCBD \uC2DC\uAC04\uB300\uC5D0 \uC6B4\uC601\uC744 \uC2DC\uC791\uD569\uB2C8\uB2E4.'
    ]
  };

  // 珥덇린 ?꾩튂 濡쒕뵫 理쒖쟻???곹깭
  const [isLocationLoaded, setIsLocationLoaded] = useState(false);
  const [initialCenter, setInitialCenter] = useState({ lat: 37.5665, lng: 126.9780 });
  const [hasIntroElapsed, setHasIntroElapsed] = useState(false);
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  const [isIntroExiting, setIsIntroExiting] = useState(false);

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAPS_API_KEY,
    libraries: ['services', 'clusterer', 'drawing'],
  });

  // 猷⑦듃 硫붾え 由ъ뒪??(?곗쭊 諛붾툝 30遺??좎?)
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

  // 遺?쒕윭???ㅽ봽???쇳꽣留곸쓣 ?꾪븳 ?ы띁 ?⑥닔
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

  const focusSeoulStationAtDefaultZoom = () => {
    if (!map) return;

    map.setLevel(4);
    window.setTimeout(() => {
      panToWithOffset(seoulStationCoords.lat, seoulStationCoords.lng);
    }, 180);
  };

  const focusBusStopAtDefaultZoom = (stopConfig) => {
    if (!map) return;

    map.setLevel(4);
    window.setTimeout(() => {
      panToWithOffset(stopConfig.coords.lat, stopConfig.coords.lng);
    }, 180);
  };

  const openYangjaeFlowerMarketDirections = () => {
    const encodedName = encodeURIComponent(yangjaeFlowerMarketName);
    const tmapUrl = `tmap://search?name=${encodedName}`;
    const userAgent = navigator.userAgent || '';
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

    if (!isAndroid && !isIOS) {
      alert('紐⑤컮??湲곌린?먯꽌 ?곕㏊ 湲몄갼湲곕? ?????덉뒿?덈떎.');
      return;
    }

    const fallbackUrl = isIOS
      ? 'https://apps.apple.com/kr/app/tmap/id431589174'
      : 'https://play.google.com/store/apps/details?id=com.skt.tmap.ku';

    const fallbackTimer = window.setTimeout(() => {
      window.location.href = fallbackUrl;
    }, 1200);

    const clearFallback = () => window.clearTimeout(fallbackTimer);

    window.addEventListener('pagehide', clearFallback, { once: true });
    window.addEventListener('blur', clearFallback, { once: true });
    window.location.href = tmapUrl;
  };

  const reverseGeocodeLocation = async (coords) => {
    if (!window.kakao?.maps?.services?.Geocoder || !coords) {
      return {
        primary: '\uD604\uC7AC \uC704\uCE58',
        secondary: '\uC8FC\uC18C \uC815\uBCF4\uB97C \uD655\uC778\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.'
      };
    }

    return new Promise((resolve) => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2Address(coords.lng, coords.lat, (result, status) => {
        if (status !== window.kakao.maps.services.Status.OK || !result?.[0]) {
          resolve({
            primary: '\uD604\uC7AC \uC704\uCE58',
            secondary: '\uC8FC\uC18C \uC815\uBCF4\uB97C \uD655\uC778\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.'
          });
          return;
        }

        const roadAddress = result[0].road_address?.address_name || '';
        const jibunAddress = result[0].address?.address_name || '';

        resolve({
          primary: roadAddress || jibunAddress || '\uD604\uC7AC \uC704\uCE58',
          secondary:
            roadAddress && jibunAddress && roadAddress !== jibunAddress
              ? jibunAddress
              : roadAddress
                ? '\uC9C0\uBC88 \uC8FC\uC18C'
                : '\uC8FC\uC18C \uC815\uBCF4\uB97C \uD655\uC778 \uC911'
        });
      });
    });
  };

  const openCurrentLocationInfo = async () => {
    if (!myLocation) return;

    const requestId = ++currentLocationRequestIdRef.current;
    const nearbyRadiusMeters = 1200;
    const fallbackAddress = {
      primary: '\uD604\uC7AC \uC704\uCE58',
      secondary: '\uC8FC\uC18C \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911'
    };

    setSelectedMemoId(null);
    setSelectedStarbucksId(null);
    setSelectedSubwayArrivals(null);
    setSelectedBusStop(null);
    setIsYangjaeFlowerMarketSelected(false);
    setIsFlowerMarketSheetOpen(false);

    panToWithOffset(myLocation.lat, myLocation.lng);

    setSelectedCurrentLocationInfo({
      title: '\uB0B4 \uC8FC\uBCC0 \uC815\uBCF4',
      coords: myLocation,
      fetchedAt: formatDateTime(new Date().toISOString()),
      addressPrimary: fallbackAddress.primary,
      addressSecondary: fallbackAddress.secondary,
      nearbyRadiusMeters,
      nearbyMemoCount: 0,
      nearestMemo: null,
      nearestStarbucks: null,
      nearestBusStop: null,
      nearbyPlaces: [],
      nearbyPlacesError: null,
      loading: true
    });

    const memoEntries = rootMemos
      .map((item) => ({
        id: item.id,
        nickname: item.nickname,
        text: item.text,
        distanceMeters: calculateDistanceMeters(myLocation, { lat: item.lat, lng: item.lng })
      }))
      .filter((item) => Number.isFinite(item.distanceMeters))
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    const starbucksEntries = starbucksPlaces
      .map((place) => ({
        id: place.id,
        name: place.name,
        address: place.address,
        distanceMeters: calculateDistanceMeters(myLocation, { lat: place.lat, lng: place.lng })
      }))
      .filter((item) => Number.isFinite(item.distanceMeters))
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    const busStopEntries = [
      { id: 'gyeonggi-bus-stop', name: '\uD558\uC548\uC8FC\uACF52.9\uB2E8\uC9C0\uC55E', mobileNo: '14156', coords: gyeonggiBusStop.coords },
      { id: 'gyeonggi-bus-stop-citizen-gym', name: '\uAD11\uBA85\uC2DC\uBBFC\uCCB4\uC721\uAD00', mobileNo: '14141', coords: citizenGymBusStop.coords },
      { id: 'seoul-bus-stop', name: '\uB3C5\uC0B0\uC5ED2\uBC88\uCD9C\uAD6C', mobileNo: '18-643', coords: seoulBusStop.coords }
    ]
      .map((item) => ({
        ...item,
        distanceMeters: calculateDistanceMeters(myLocation, item.coords)
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    let nearbyPlaces = [];
    let nearbyPlacesError = null;

    try {
      const nearbyResponse = await fetch(
        "/api/nearby?lat=" + encodeURIComponent(myLocation.lat) +
        "&lng=" + encodeURIComponent(myLocation.lng) +
        "&radius=" + nearbyRadiusMeters +
        "&size=5"
      );
      const nearbyPayload = await nearbyResponse.text();
      const nearbyData = JSON.parse(nearbyPayload);

      if (!nearbyResponse.ok || nearbyData.error) throw new Error(nearbyData.message || nearbyData.error || 'Failed to load nearby places');

      nearbyPlaces = Array.isArray(nearbyData.places) ? nearbyData.places : [];
    } catch (error) {
      nearbyPlacesError = error.message || '\uC8FC\uBCC0 \uBA85\uC18C \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.';
    }

    const address = await reverseGeocodeLocation(myLocation);

    if (requestId !== currentLocationRequestIdRef.current) return;

    setSelectedCurrentLocationInfo({
      title: '\uB0B4 \uC8FC\uBCC0 \uC815\uBCF4',
      coords: myLocation,
      fetchedAt: formatDateTime(new Date().toISOString()),
      addressPrimary: address.primary,
      addressSecondary: address.secondary,
      nearbyRadiusMeters,
      nearbyMemoCount: memoEntries.filter((item) => item.distanceMeters <= nearbyRadiusMeters).length,
      nearestMemo: memoEntries[0] || null,
      nearestStarbucks: starbucksEntries[0] || null,
      nearestBusStop: busStopEntries[0] || null,
      nearbyPlaces,
      nearbyPlacesError,
      loading: false
    });
  };
  const fetchBusStopArrival = async (force = false, stopConfig = activeBusStopConfig || gyeonggiBusStop) => {
    const requestId = ++busRequestIdRef.current;
    setActiveBusStopConfig(stopConfig);
    setSelectedBusStop({
      station: {
        ...stopConfig.fallbackStation,
        x: stopConfig.coords.lng,
        y: stopConfig.coords.lat,
        provider: stopConfig.provider
      },
      arrivals: [],
      loading: true,
      error: null,
      message: null
    });

    try {
      const response = await fetch(
        `/api/bus?station=${encodeURIComponent(stopConfig.stationNumber)}&provider=${stopConfig.provider}${
          force ? '&force=1' : ''
        }`
      );
      const payload = await response.text();
      let data;

      try {
        data = JSON.parse(payload);
      } catch {
        throw new Error(payload || 'Invalid bus API response');
      }

      if (requestId !== busRequestIdRef.current) return;

      setSelectedBusStop({
        ...data,
        loading: false
      });
    } catch (error) {
      if (requestId !== busRequestIdRef.current) return;

      setSelectedBusStop({
        station: {
          ...stopConfig.fallbackStation,
          x: stopConfig.coords.lng,
          y: stopConfig.coords.lat,
          provider: stopConfig.provider
        },
        arrivals: [],
        loading: false,
        error: '踰꾩뒪 API ?ㅻ쪟',
        message: error.message
      });
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
    const introTimer = window.setTimeout(() => {
      setHasIntroElapsed(true);
    }, 2000);

    return () => window.clearTimeout(introTimer);
  }, []);

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

  // 吏?ν삎 以???? 6?덈꺼 ?댁긽????吏?섏쿋 諛붾툝 ?먮룞 ?リ린 (v40.2)
  useEffect(() => {
    if (mapLevel >= 6 && selectedSubwayArrivals) {
      setSelectedSubwayArrivals(null);
    }
  }, [mapLevel, selectedSubwayArrivals]);

  useEffect(() => {
    if (!hasIntroElapsed || loading || !isLocationLoaded || isIntroExiting || !isIntroVisible) {
      return;
    }

    setIsIntroExiting(true);
  }, [hasIntroElapsed, loading, isLocationLoaded, isIntroExiting, isIntroVisible]);

  useEffect(() => {
    if (!isIntroExiting) {
      return;
    }

    const exitTimer = window.setTimeout(() => {
      setIsIntroVisible(false);
    }, 600);

    return () => window.clearTimeout(exitTimer);
  }, [isIntroExiting]);

  const handleMyLocationBtn = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    requestLocation(true);
  };

  const handleReplySubmit = async (parentId) => {
    if (!replyText.trim()) return;
    const parentMemo = memos.find(m => m.id === parentId);
    if (!parentMemo) return;
    const neighborhood = parentMemo.nickname?.split(' ')[0] || '\uC5B4\uB518\uAC00';
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
    // 1-3媛쒖쓽 ?듦? ?쒕뜡 寃곗젙
    const replyCount = Math.floor(Math.random() * 3) + 1;
    
    // 0-60珥??ъ씠???쒕뜡 吏???쒓컙???앹꽦
    for (let i = 0; i < replyCount; i++) {
      const delay = Math.floor(Math.random() * 60000);
      
      setTimeout(async () => {
        // 1. 而⑦뀓?ㅽ듃 遺꾩꽍 (?쒓컙?)
        const hour = new Date().getHours();
        let timeKey = 'night';
        if (hour >= 6 && hour < 11) timeKey = 'morning';
        else if (hour >= 11 && hour < 17) timeKey = 'afternoon';
        else if (hour >= 17 && hour < 22) timeKey = 'evening';

        // 2. 而⑦뀓?ㅽ듃 遺꾩꽍 (?좎뵪) - Open-Meteo API ?붿껌 (v38.1)
        let weatherKey = 'sunny';
        try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${parentMemo.lat}&longitude=${parentMemo.lng}&current_weather=true`);
          const data = await res.json();
          const code = data.current_weather.weathercode;
          if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) weatherKey = 'rainy';
          else if ([71, 73, 75, 77, 85, 86].includes(code)) weatherKey = 'snowy';
          else if ([1, 2, 3, 45, 48].includes(code)) weatherKey = 'cloudy';
        } catch (e) { console.warn('Weather fetch for AI failed:', e); }

        // 3. ?곸젅???섎Ⅴ?뚮굹 ?좏깮
        const persona = AI_PERSONAS[Math.floor(Math.random() * AI_PERSONAS.length)];
        
        // 4. ?ㅻ쭏???듦? 濡쒖쭅 (?곗꽑?쒖쐞: ?ㅼ썙??> ?좎뵪 > ?쒓컙? > 湲곕낯 ?ㅽ???
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

        // 5. ?됰꽕???앹꽦
        const neighborhood = parentMemo.nickname?.split(' ')[0] || '\uC5B4\uB518\uAC00';
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
  // [v45.7] ?쒖슱??怨듭떇 ?쒓컙???곗씠??媛?몄삤湲?(諛깆뾽 濡쒖쭅 ?꾩쟾 ?쒓굅)
  const fetchSubwayTimetable = async (dayType = "1", force = false) => {
    const CACHE_KEY = `subway_timetable_${dayType}`;
    const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; 
    
    // 1. 罹먯떆 ?뺤씤
    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          const isExpired = new Date().getTime() - timestamp > CACHE_DURATION;
          if (!isExpired && data.up?.length > 0) {
            setSelectedSubwayArrivals({ ...data, loading: false });
            return;
          }
        } catch (e) { console.error('Cache Parse Error:', e); }
      }
    }

    // 2. ?ㅼ쭅 ?ㅼ떆媛?API ?붿껌 (諛깆뾽 ?곗씠???놁쓬)
    setSelectedSubwayArrivals((prev) => ({
      ...(prev || {}),
      type: prev?.type || 'timetable',
      dayType,
      up: prev?.up || [],
      down: prev?.down || [],
      loading: true,
      error: null,
      message: null,
      isFallback: false
    }));
    
    try {
      // ?곹뻾(1)怨??섑뻾(2) ?곗씠?곕? ?쒖감?곸쑝濡??뺥솗???섏쭛
      const [upRes, downRes] = await Promise.all([
        fetch(`/api/subway?type=timetable&dayType=${dayType}&bound=1`),
        fetch(`/api/subway?type=timetable&dayType=${dayType}&bound=2`)
      ]);
      
      const upData = await upRes.json();
      const downData = await downRes.json();
      
      // API ?묐떟 ?ㅻ쪟 泥댄겕 (v45.7)
      if (upData.error || downData.error) {
        setSelectedSubwayArrivals({ 
          error: upData.error || downData.error, 
          message: upData.message || downData.message, 
          loading: false,
          isFallback: false 
        });
        return;
      }

      const upList = upData.SearchSTNTimeTableByIDService?.row || [];
      const downList = downData.SearchSTNTimeTableByIDService?.row || [];

      // ?곗씠?곌? ?꾩삁 ?녿뒗 寃쎌슦 ?먮윭 ?쒖떆
      if (upList.length === 0 && downList.length === 0) {
        setSelectedSubwayArrivals({ 
          error: "?곗씠???놁쓬", 
          message: "?꾩옱 ?쒕쾭濡쒕????섏떊???쒓컙???뺣낫媛 ?놁뒿?덈떎. (?몄쬆 ???쒖꽦???湲?以묒씪 ???덉뒿?덈떎.)", 
          loading: false 
        });
        return;
      }

      const timetableData = {
        type: 'timetable',
        dayType,
        up: upList,
        down: downList,
        isFallback: false
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: timetableData, timestamp: new Date().getTime() }));
      setSelectedSubwayArrivals({ ...timetableData, loading: false });
    } catch (e) {
      setSelectedSubwayArrivals({ 
        error: "?ㅽ듃?뚰겕 ?ㅻ쪟", 
        message: `?쒕쾭 ?듭떊???ㅽ뙣?덉뒿?덈떎: ${e.message}`, 
        loading: false 
      });
    }
  };

  const submitNewMemo = async () => {
    if (!newMemoText.trim() || !writingMemoCoords || isSubmittingMemo) return;

    setIsSubmittingMemo(true);

    const pendingText = newMemoText.trim();
    const pendingCoords = writingMemoCoords;
    const tempId = `temp-${Date.now()}`;
    const fallbackNeighborhood = '\uC774 \uB3D9\uB124';
    const fallbackNickname = `${fallbackNeighborhood} \uBC14\uBE14`;

    setMemos((prev) => [
      ...prev,
      {
        id: tempId,
        lat: pendingCoords.lat,
        lng: pendingCoords.lng,
        text: pendingText,
        nickname: fallbackNickname,
        created_at: new Date().toISOString(),
        popped_at: null,
        parent_id: null,
        is_new: true,
        is_pending: true
      }
    ]);

    panToWithOffset(pendingCoords.lat, pendingCoords.lng);
    setWritingMemoCoords(null);
    setNewMemoText('');
    setIsMemoMode(false);

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2RegionCode(pendingCoords.lng, pendingCoords.lat, async (result, status) => {
      let neighborhood = fallbackNeighborhood;
      if (status === window.kakao.maps.services.Status.OK) {
        const region = result.find((r) => r.region_type === 'H') || result[0];
        neighborhood = region ? region.region_3depth_name : fallbackNeighborhood;
      }

      const p = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
      const s = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
      const nickname = `${neighborhood} ${p}${s}`;
      const newMemo = {
        lat: pendingCoords.lat,
        lng: pendingCoords.lng,
        text: pendingText,
        nickname
      };

      try {
        const { data, error } = await supabase.from('memos').insert([newMemo]).select();

        if (!error && data?.[0]) {
          const createdMemo = { ...data[0], is_new: true };
          setMemos((prev) => prev.map((memo) => (memo.id === tempId ? createdMemo : memo)));
          triggerAIResponse(data[0]);

          setTimeout(() => {
            setMemos((prev) => prev.map((memo) => (memo.id === data[0].id ? { ...memo, is_new: false } : memo)));
          }, 2000);
        } else {
          setMemos((prev) => prev.filter((memo) => memo.id !== tempId));
        }
      } catch (err) {
        setMemos((prev) => prev.filter((memo) => memo.id !== tempId));
        console.error('Insert error:', err);
      } finally {
        setIsSubmittingMemo(false);
      }
    });
  };
  const handleDeleteMemo = async (id) => {
    if (confirm('??硫붾え瑜???젣?섏떆寃좎뒿?덇퉴?')) {
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

  const isMapReady = !loading && isLocationLoaded;
  const introOverlay = isIntroVisible ? (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isIntroExiting ? 0 : 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="pointer-events-none absolute inset-0 z-[2000] flex items-center justify-center bg-[#FF4D00]"
    >
      <motion.div
        initial={{ scale: 1, y: 0, rotate: 0, opacity: 1, filter: 'blur(0px)' }}
        animate={isIntroExiting
          ? { scale: 1.9, y: 0, rotate: 0, opacity: 0, filter: 'blur(8px)' }
          : { scale: 1, y: 0, rotate: 0, opacity: 1, filter: 'blur(0px)' }}
        transition={isIntroExiting
          ? { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
          : { duration: 0.2 }}
        className="relative flex items-center justify-center"
      >
        <span className="logo-font relative text-[29px] leading-none tracking-[0] text-white md:text-[38px]">
          BABBLE
        </span>
      </motion.div>
    </motion.div>
  ) : null;

  if (!isMapReady) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-white">
        {introOverlay}
        {false && (<div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white/40 blur-xl scale-125" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/60 bg-white/45 shadow-[0_12px_40px_rgba(104,86,58,0.12)] backdrop-blur-sm">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#9E9484" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83a1 1 0 0 1 1.447.894v11.549a2 2 0 0 1-1.106 1.789l-4.553 2.276a2 2 0 0 1-1.788 0l-4.553-2.276a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 2 18.894V7.345a2 2 0 0 1 1.106-1.789l4.553-2.276a2 2 0 0 1 1.788 0l4.553 2.276Z" />
                <path d="M15 5.5v13" />
                <path d="M9 5.5v13" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-[#7D7467] text-[15px] font-semibold tracking-tight">吏?꾨? 以鍮꾪븯??以묒엯?덈떎</span>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B8AA93] animate-bounce [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#B8AA93] animate-bounce [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#B8AA93] animate-bounce" />
            </div>
          </div>
        </div>)}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-visible font-sans antialiased z-0"
      style={{
        backgroundColor: '#FFFFFF'
      }}
    >
      <Map
        center={initialCenter}
        level={4}
        onCreate={m => { setMap(m); m.setMaxLevel(11); m.relayout(); setTimeout(() => m.relayout(), 300); }}
        onZoomChanged={m => setMapLevel(m.getLevel())}
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%' }}
      >
        {myLocation && (
          <CustomOverlayMap position={myLocation} zIndex={999} xAnchor={0.5} yAnchor={0.5} clickable={true}>
            <div
              className="relative flex cursor-pointer items-center justify-center"
              onClick={() => {
                openCurrentLocationInfo();
              }}
            >
              <div className="absolute w-8 h-8 bg-[#FF4D00] rounded-full animate-ping opacity-30" />
              <div className="relative w-[24px] h-[24px] bg-[#FF4D00] border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                <div className="w-[6px] h-[6px] bg-white rounded-full" />
              </div>
            </div>
          </CustomOverlayMap>
        )}

        {/* 1?몄꽑 ?쒖슱???밸퀎 留덉빱 (v41.0 - LNB ?듯빀) */}
        <MapMarker 
          position={seoulStationCoords}
          image={{ 
            src: 'data:image/svg+xml;base64,' + btoa(`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="12" fill="#3D53B3" stroke="white" stroke-width="2.5"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="700" fill="white">S</text></svg>`), 
            size: { width: 28, height: 28 },
            offset: { x: 14, y: 14 }
          }}
          onClick={() => {
            setSelectedStarbucksId(null);
            setSelectedMemoId(null);
            setSelectedSubwayArrivals(null);
            setSelectedBusStop(null);
            setSelectedCurrentLocationInfo(null);

            if (mapLevel >= 6) {
              focusSeoulStationAtDefaultZoom();
              return;
            }

            panToWithOffset(seoulStationCoords.lat, seoulStationCoords.lng);
            fetchSubwayTimetable("1");
          }}
          zIndex={100}
        />

        <MapMarker
          position={yangjaeFlowerMarketCoords}
          image={{
            src: 'data:image/svg+xml;base64,' + btoa(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#FF2FA3" stroke="white" stroke-width="2"/><g transform="translate(12 12) scale(0.45)"><ellipse cx="0" cy="-8.8" rx="4.6" ry="7.4" fill="white"/><ellipse cx="8.4" cy="-2.7" rx="4.6" ry="7.4" transform="rotate(72 8.4 -2.7)" fill="white"/><ellipse cx="5.2" cy="7.1" rx="4.6" ry="7.4" transform="rotate(144 5.2 7.1)" fill="white"/><ellipse cx="-5.2" cy="7.1" rx="4.6" ry="7.4" transform="rotate(-144 -5.2 7.1)" fill="white"/><ellipse cx="-8.4" cy="-2.7" rx="4.6" ry="7.4" transform="rotate(-72 -8.4 -2.7)" fill="white"/><circle cx="0" cy="0" r="4.8" fill="white"/></g></svg>`),
            size: { width: 24, height: 24 },
            offset: { x: 12, y: 12 }
          }}
          onClick={() => {
            setSelectedStarbucksId(null);
            setSelectedMemoId(null);
            setSelectedSubwayArrivals(null);
            setSelectedBusStop(null);
            setSelectedCurrentLocationInfo(null);
            setIsYangjaeFlowerMarketSelected(false);
            setIsFlowerMarketSheetOpen(true);
            panToWithOffset(yangjaeFlowerMarketCoords.lat, yangjaeFlowerMarketCoords.lng);
          }}
          zIndex={100}
        />

        <MapMarker
          position={haanBusStopCoords}
          image={{
            src:
              'data:image/svg+xml;base64,' +
              btoa(
                `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="12" fill="#299738" stroke="white" stroke-width="2.5"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="700" fill="white">B</text></svg>`
              ),
            size: { width: 28, height: 28 },
            offset: { x: 14, y: 14 }
          }}
          onClick={() => {
            setSelectedStarbucksId(null);
            setSelectedMemoId(null);
            setSelectedSubwayArrivals(null);
            setSelectedCurrentLocationInfo(null);
            setIsFlowerMarketSheetOpen(false);

            if (mapLevel >= 6) {
              setSelectedBusStop(null);
              focusBusStopAtDefaultZoom(gyeonggiBusStop);
              return;
            }

            panToWithOffset(haanBusStopCoords.lat, haanBusStopCoords.lng);
            fetchBusStopArrival(false, gyeonggiBusStop);
          }}
          zIndex={100}
        />

        <MapMarker
          position={citizenGymBusStop.coords}
          image={{
            src:
              'data:image/svg+xml;base64,' +
              btoa(
                `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="12" fill="#299738" stroke="white" stroke-width="2.5"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="700" fill="white">B</text></svg>`
              ),
            size: { width: 28, height: 28 },
            offset: { x: 14, y: 14 }
          }}
          onClick={() => {
            setSelectedStarbucksId(null);
            setSelectedMemoId(null);
            setSelectedSubwayArrivals(null);
            setSelectedCurrentLocationInfo(null);
            setIsFlowerMarketSheetOpen(false);

            if (mapLevel >= 6) {
              setSelectedBusStop(null);
              focusBusStopAtDefaultZoom(citizenGymBusStop);
              return;
            }

            panToWithOffset(citizenGymBusStop.coords.lat, citizenGymBusStop.coords.lng);
            fetchBusStopArrival(false, citizenGymBusStop);
          }}
          zIndex={100}
        />

        <MapMarker
          position={seoulBusStop.coords}
          image={{
            src:
              'data:image/svg+xml;base64,' +
              btoa(
                `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="12" fill="#299738" stroke="white" stroke-width="2.5"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="700" fill="white">B</text></svg>`
              ),
            size: { width: 28, height: 28 },
            offset: { x: 14, y: 14 }
          }}
          onClick={() => {
            setSelectedStarbucksId(null);
            setSelectedMemoId(null);
            setSelectedSubwayArrivals(null);
            setSelectedCurrentLocationInfo(null);
            setIsFlowerMarketSheetOpen(false);

            if (mapLevel >= 6) {
              setSelectedBusStop(null);
              focusBusStopAtDefaultZoom(seoulBusStop);
              return;
            }

            panToWithOffset(seoulBusStop.coords.lat, seoulBusStop.coords.lng);
            fetchBusStopArrival(false, seoulBusStop);
          }}
          zIndex={100}
        />

        {isStarbucksVisible && starbucksPlaces.map(place => (
          <React.Fragment key={`sb-${place.id}`}>
            <MapMarker position={{ lat: place.lat, lng: place.lng }} 
              image={{ src: 'data:image/svg+xml;base64,' + btoa('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#00704a" stroke="white" stroke-width="2"/><path d="M12 6.25L13.5 10.75H18L14.5 13.25L15.5 17.75L12 15.25L8.5 17.75L9.5 13.25L6 10.75H10.5L12 6.25Z" fill="white"/></svg>'), size: { width: 24, height: 24 } }}
              onClick={() => { 
                panToWithOffset(place.lat, place.lng);
                setSelectedSubwayArrivals(null);
                setSelectedBusStop(null);
                setSelectedCurrentLocationInfo(null);
                setIsYangjaeFlowerMarketSelected(false);
                setIsFlowerMarketSheetOpen(false);
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
              <motion.div 
                initial={{ opacity: 0, scale: 0, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  type: 'spring', 
                  damping: 15, 
                  stiffness: 280,
                  mass: 0.8
                }}
                className={`relative w-0 h-0 group pointer-events-none ${memo.is_popping ? 'animate-bubble-pop' : ''}`}
              >
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
                      setIsYangjaeFlowerMarketSelected(false);
                      setIsFlowerMarketSheetOpen(false);
                      setSelectedSubwayArrivals(null); // 吏?섏쿋 LNB ?リ린
                      setSelectedBusStop(null);
                      setSelectedCurrentLocationInfo(null);
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
              </motion.div>
            </CustomOverlayMap>
          ))
        )}
      </Map>

      <AnimatePresence>
        {writingMemoCoords && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[400px] bg-white rounded-[32px] p-8 shadow-[0_30px_60px_rgba(255,77,0,0.15)] pointer-events-auto border border-white"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[18px] font-black text-gray-900 tracking-tight">여기에 바블 남기기</h3>
                <button
                  onClick={() => {
                    if (isSubmittingMemo) return;
                    setWritingMemoCoords(null);
                    setNewMemoText('');
                    setIsMemoMode(false);
                  }}
                  disabled={isSubmittingMemo}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              <textarea
                autoFocus
                value={newMemoText}
                onChange={(e) => setNewMemoText(e.target.value)}
                placeholder="어떤 이야기를 남기고 싶나요?"
                className="w-full h-24 bg-white rounded-2xl p-4 text-[15px] font-medium border border-gray-100 focus:border-[#FF4D00] focus:ring-4 focus:ring-[#FF4D00]/10 focus:outline-none transition-all resize-none mb-6 placeholder:text-gray-400"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (isSubmittingMemo) return;
                    setWritingMemoCoords(null);
                    setNewMemoText('');
                    setIsMemoMode(false);
                  }}
                  disabled={isSubmittingMemo}
                  className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold text-[15px] disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={submitNewMemo}
                  disabled={!newMemoText.trim() || isSubmittingMemo}
                  className="flex-[2] py-4 rounded-2xl bg-[#FF4D00] text-white font-bold text-[15px] shadow-[0_10px_20px_rgba(255,77,0,0.2)] disabled:opacity-50"
                >
                  {isSubmittingMemo ? '남기는 중...' : '바블 남기기'}
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
        onClose={() => { setSelectedMemoId(null); setSelectedSubwayArrivals(null); setSelectedBusStop(null); setSelectedCurrentLocationInfo(null); setSelectedStarbucksId(null); setIsYangjaeFlowerMarketSelected(false); setIsFlowerMarketSheetOpen(false); }} 
        onDelete={handleDeleteMemo} 
        onReplySubmit={handleReplySubmit} 
        onPop={handlePopBubble} 
        replyText={replyText} 
        setReplyText={setReplyText} 
        formatDateTime={formatDateTime} 
        subwayArrivals={selectedSubwayArrivals}
        subwayFetchTime={subwayFetchTime}
        onTimetableTabChange={fetchSubwayTimetable}
        busStop={selectedBusStop}
        currentLocationInfo={selectedCurrentLocationInfo}
        onBusRefresh={fetchBusStopArrival}
        starbucks={null}
      />

      <FlowerMarketSheet
        market={isFlowerMarketSheetOpen ? yangjaeFlowerMarketInfo : null}
        onClose={() => setIsFlowerMarketSheetOpen(false)}
        onDirections={openYangjaeFlowerMarketDirections}
      />

      <div className="pointer-events-none fixed inset-0 z-40 overflow-visible">
        <Header />
        <Footer />
      </div>

      {!isIntroVisible && (
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
                {'\uBA54\uBAA8 \uC704\uCE58\uB97C \uB20C\uB7EC\uC8FC\uC138\uC694'}
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
      )}

      {introOverlay}

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
