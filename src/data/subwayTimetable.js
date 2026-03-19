// src/data/subwayTimetable.js
// 서울역 1호선 대표 시간표 데이터 (v45.5 기준 정밀 업데이트)
// 실시간 API 연동 전까지 또는 장애 시 Fallback 데이터로 사용됩니다.

export const SEOUL_STATION_TIMETABLE_STATIC = {
  "1": { // 평일 (Weekdays)
    "up": [
      { "LEFTTIME": "05:20:00", "DESTSTATION_NM": "소요산", "TRAIN_NO": "1002" },
      { "LEFTTIME": "05:39:00", "DESTSTATION_NM": "의정부", "TRAIN_NO": "1004" },
      { "LEFTTIME": "05:51:00", "DESTSTATION_NM": "동두천", "TRAIN_NO": "1006" },
      { "LEFTTIME": "14:12:00", "DESTSTATION_NM": "의정부", "TRAIN_NO": "1152" },
      { "LEFTTIME": "14:32:00", "DESTSTATION_NM": "소요산", "TRAIN_NO": "1154" },
      { "LEFTTIME": "23:05:00", "DESTSTATION_NM": "광운대", "TRAIN_NO": "1282" },
      { "LEFTTIME": "23:45:00", "DESTSTATION_NM": "동묘앞", "TRAIN_NO": "1286" }
    ],
    "down": [
      { "LEFTTIME": "05:19:00", "DESTSTATION_NM": "인천", "TRAIN_NO": "1001" },
      { "LEFTTIME": "05:35:00", "DESTSTATION_NM": "천안", "TRAIN_NO": "1003" },
      { "LEFTTIME": "05:54:00", "DESTSTATION_NM": "신창", "TRAIN_NO": "1005" },
      { "LEFTTIME": "14:05:00", "DESTSTATION_NM": "인천", "TRAIN_NO": "1149" },
      { "LEFTTIME": "14:25:00", "DESTSTATION_NM": "천안", "TRAIN_NO": "1151" },
      { "LEFTTIME": "23:15:00", "DESTSTATION_NM": "인천", "TRAIN_NO": "1281" },
      { "LEFTTIME": "23:55:00", "DESTSTATION_NM": "병점", "TRAIN_NO": "1285" }
    ]
  },
  "2": { // 토요일 (Saturday)
    "up": [
      { "LEFTTIME": "05:30:00", "DESTSTATION_NM": "소요산", "TRAIN_NO": "2002" },
      { "LEFTTIME": "23:10:00", "DESTSTATION_NM": "동묘앞", "TRAIN_NO": "2282" }
    ],
    "down": [
      { "LEFTTIME": "05:25:00", "DESTSTATION_NM": "인천", "TRAIN_NO": "2001" },
      { "LEFTTIME": "23:20:00", "DESTSTATION_NM": "병점", "TRAIN_NO": "2281" }
    ]
  },
  "3": { // 공휴일 (Sunday/Holiday)
    "up": [
      { "LEFTTIME": "05:30:00", "DESTSTATION_NM": "소요산", "TRAIN_NO": "3002" },
      { "LEFTTIME": "23:10:00", "DESTSTATION_NM": "동묘앞", "TRAIN_NO": "3282" }
    ],
    "down": [
      { "LEFTTIME": "05:25:00", "DESTSTATION_NM": "인천", "TRAIN_NO": "3001" },
      { "LEFTTIME": "23:20:00", "DESTSTATION_NM": "병점", "TRAIN_NO": "3281" }
    ]
  }
};
