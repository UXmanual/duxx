import { getSubwayLineColor } from './subwayLineMeta.js';

const RAW_SUBWAY_STATIONS = {
  "seoul": {
    "key": "seoul",
    "name": "\uc11c\uc6b8\uc5ed",
    "searchName": "\uc11c\uc6b8\uc5ed",
    "line": "1\ud638\uc120",
    "lineApiName": "01\ud638\uc120",
    "coords": {
      "lat": 37.555979,
      "lng": 126.972091
    },
    "markerLabel": "S",
    "address": "\uc11c\uc6b8\ud2b9\ubcc4\uc2dc \uc6a9\uc0b0\uad6c \ud55c\uac15\ub300\ub85c 405",
    "phone": "1544-7788",
    "stationCd": "0150",
    "frCode": "133"
  },
  "doksan": {
    "key": "doksan",
    "name": "\ub3c5\uc0b0\uc5ed",
    "searchName": "\ub3c5\uc0b0",
    "line": "1\ud638\uc120",
    "lineApiName": "01\ud638\uc120",
    "coords": {
      "lat": 37.466006,
      "lng": 126.88953
    },
    "markerLabel": "S",
    "address": "\uc11c\uc6b8\ud2b9\ubcc4\uc2dc \uae08\ucc9c\uad6c \ubc9a\uaf43\ub85c 115",
    "phone": "1544-7788",
    "stationCd": "1714",
    "frCode": "P143"
  },
  "cityhall-line1": {
    "key": "cityhall-line1",
    "name": "\uc2dc\uccad\uc5ed",
    "searchName": "\uc2dc\uccad",
    "line": "1\ud638\uc120",
    "lineApiName": "01\ud638\uc120",
    "coords": {
      "lat": 37.5654798,
      "lng": 126.977114
    },
    "markerLabel": "S",
    "address": "\uc2dc\uccad, \uc9c0\ud558101, \uc138\uc885\ub300\ub85c, \uc815\ub3d9, \uc18c\uacf5\ub3d9, \uc911\uad6c, \uc11c\uc6b8\ud2b9\ubcc4\uc2dc, 04519, \ub300\ud55c\ubbfc\uad6d",
    "phone": "",
    "stationCd": "0151",
    "frCode": "132"
  },
  "cityhall-line2": {
    "key": "cityhall-line2",
    "name": "\uc2dc\uccad\uc5ed",
    "searchName": "\uc2dc\uccad",
    "line": "2\ud638\uc120",
    "lineApiName": "02\ud638\uc120",
    "coords": {
      "lat": 37.563844,
      "lng": 126.97603
    },
    "markerLabel": "S",
    "address": "\uc2dc\uccad, \uc9c0\ud558101, \uc138\uc885\ub300\ub85c, \uc815\ub3d9, \uc18c\uacf5\ub3d9, \uc911\uad6c, \uc11c\uc6b8\ud2b9\ubcc4\uc2dc, 04519, \ub300\ud55c\ubbfc\uad6d",
    "phone": "",
    "stationCd": "0201",
    "frCode": "201"
  },
  "chungmuro-line4": {
    "key": "chungmuro-line4",
    "name": "\ucda9\ubb34\ub85c\uc5ed",
    "searchName": "\ucda9\ubb34\ub85c",
    "line": "4\ud638\uc120",
    "lineApiName": "04\ud638\uc120",
    "coords": {
      "lat": 37.561510,
      "lng": 126.995263
    },
    "markerLabel": "S",
    "address": "\uc11c\uc6b8\ud2b9\ubcc4\uc2dc \uc911\uad6c \ud1f4\uacc4\ub85c \uc9c0\ud558 199",
    "phone": "",
    "stationCd": "0423",
    "frCode": "423"
  },
  "chungmuro-line3": {
    "key": "chungmuro-line3",
    "name": "\ucda9\ubb34\ub85c\uc5ed",
    "searchName": "\ucda9\ubb34\ub85c",
    "line": "3\ud638\uc120",
    "lineApiName": "03\ud638\uc120",
    "coords": {
      "lat": 37.561247703,
      "lng": 126.994336649
    },
    "markerLabel": "S",
    "address": "\uc11c\uc6b8\ud2b9\ubcc4\uc2dc \uc911\uad6c \uc7a5\ucda9\ub3d92\uac00 189-2",
    "phone": "",
    "stationCd": "0331",
    "frCode": "331"
  },
  "ddp-line4": {
    "key": "ddp-line4",
    "name": "\ub3d9\ub300\ubb38\uc5ed\uc0ac\ubb38\ud654\uacf5\uc6d0\uc5ed",
    "searchName": "\ub3d9\ub300\ubb38\uc5ed\uc0ac\ubb38\ud654\uacf5\uc6d0",
    "line": "4\ud638\uc120",
    "lineApiName": "04\ud638\uc120",
    "coords": {
      "lat": 37.565144388,
      "lng": 127.007845345
    },
    "markerLabel": "S",
    "address": "\uc11c\uc6b8\ud2b9\ubcc4\uc2dc \uc911\uad6c \uad11\ud76c\ub3d91\uac00 194",
    "phone": "",
    "stationCd": "0422",
    "frCode": "422"
  },
  "ddp-line2": {
    "key": "ddp-line2",
    "name": "\ub3d9\ub300\ubb38\uc5ed\uc0ac\ubb38\ud654\uacf5\uc6d0\uc5ed",
    "searchName": "\ub3d9\ub300\ubb38\uc5ed\uc0ac\ubb38\ud654\uacf5\uc6d0",
    "line": "2\ud638\uc120",
    "lineApiName": "02\ud638\uc120",
    "coords": {
      "lat": 37.565665761,
      "lng": 127.00895182
    },
    "markerLabel": "S",
    "address": "\uc11c\uc6b8\ud2b9\ubcc4\uc2dc \uc911\uad6c \uc744\uc9c0\ub85c \uc9c0\ud558279",
    "phone": "",
    "stationCd": "0205",
    "frCode": "205"
  },
  "ddp-line5": {
    "key": "ddp-line5",
    "name": "\ub3d9\ub300\ubb38\uc5ed\uc0ac\ubb38\ud654\uacf5\uc6d0\uc5ed",
    "searchName": "\ub3d9\ub300\ubb38\uc5ed\uc0ac\ubb38\ud654\uacf5\uc6d0",
    "line": "5\ud638\uc120",
    "lineApiName": "05\ud638\uc120",
    "coords": {
      "lat": 37.564645584,
      "lng": 127.005713128
    },
    "markerLabel": "S",
    "address": "\uc11c\uc6b8\ud2b9\ubcc4\uc2dc \uc911\uad6c \uc744\uc9c0\ub85c \uc9c0\ud558279",
    "phone": "",
    "stationCd": "0536",
    "frCode": "536"
  },
  "dongdaemun-line1": {
    "key": "dongdaemun-line1",
    "name": "\ub3d9\ub300\ubb38\uc5ed",
    "searchName": "\ub3d9\ub300\ubb38",
    "line": "1\ud638\uc120",
    "lineApiName": "01\ud638\uc120",
    "coords": {
      "lat": 37.571664,
      "lng": 127.010629
    },
    "markerLabel": "S",
    "address": "\uc11c\uc6b8\ud2b9\ubcc4\uc2dc \uc885\ub85c\uad6c \uc728\uace1\ub85c 308",
    "phone": "",
    "stationCd": "0128",
    "frCode": "128"
  },
  "dongdaemun-line4": {
    "key": "dongdaemun-line4",
    "name": "\ub3d9\ub300\ubb38\uc5ed",
    "searchName": "\ub3d9\ub300\ubb38",
    "line": "4\ud638\uc120",
    "lineApiName": "04\ud638\uc120",
    "coords": {
      "lat": 37.570907,
      "lng": 127.009316
    },
    "markerLabel": "S",
    "address": "\uc11c\uc6b8\ud2b9\ubcc4\uc2dc \uc885\ub85c\uad6c \uc728\uace1\ub85c 308",
    "phone": "",
    "stationCd": "0421",
    "frCode": "421"
  }
};

export const SUBWAY_STATIONS = Object.fromEntries(
  Object.entries(RAW_SUBWAY_STATIONS).map(([key, station]) => [
    key,
    {
      ...station,
      lineColor: getSubwayLineColor(station.lineApiName || station.line)
    }
  ])
);

export const SUBWAY_STATION_LIST = Object.values(SUBWAY_STATIONS);
