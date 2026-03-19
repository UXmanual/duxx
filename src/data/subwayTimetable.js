/**
 * [Data] 서울역 1호선 대표 시간표 (내장 데이터)
 * @description API 연동 불가 시 또는 캐싱용으로 사용되는 평일/토요일/공휴일 대표 시간표
 * 출처: 서울시 공공 데이터 포털 (대표 시간표 기준)
 */
export const SEOUL_STATION_TIMETABLE_STATIC = {
  "1": { // 평일
    "up": [
      { "LEFTTIME": "05:10:00", "DESTSTATION_NM": "의정부" },
      { "LEFTTIME": "05:32:00", "DESTSTATION_NM": "양주" },
      { "LEFTTIME": "05:48:00", "DESTSTATION_NM": "소요산" },
      { "LEFTTIME": "06:05:00", "DESTSTATION_NM": "연천" },
      { "LEFTTIME": "06:17:00", "DESTSTATION_NM": "양주" },
      { "LEFTTIME": "06:30:00", "DESTSTATION_NM": "소요산" },
      { "LEFTTIME": "06:45:00", "DESTSTATION_NM": "의정부" },
      { "LEFTTIME": "07:02:00", "DESTSTATION_NM": "소요산" },
      { "LEFTTIME": "07:15:00", "DESTSTATION_NM": "양주" },
      { "LEFTTIME": "07:30:00", "DESTSTATION_NM": "소요산" },
      { "LEFTTIME": "08:12:00", "DESTSTATION_NM": "의정부" },
      { "LEFTTIME": "09:15:00", "DESTSTATION_NM": "소요산" },
      { "LEFTTIME": "10:10:00", "DESTSTATION_NM": "의정부" },
      { "LEFTTIME": "11:05:00", "DESTSTATION_NM": "양주" },
      { "LEFTTIME": "12:12:00", "DESTSTATION_NM": "소요산" },
      { "LEFTTIME": "13:05:00", "DESTSTATION_NM": "의정부" },
      { "LEFTTIME": "14:15:00", "DESTSTATION_NM": "소요산" },
      { "LEFTTIME": "15:10:00", "DESTSTATION_NM": "양주" },
      { "LEFTTIME": "16:05:00", "DESTSTATION_NM": "소요산" },
      { "LEFTTIME": "17:15:00", "DESTSTATION_NM": "의정부" },
      { "LEFTTIME": "18:05:00", "DESTSTATION_NM": "양주" },
      { "LEFTTIME": "18:32:00", "DESTSTATION_NM": "소요산" },
      { "LEFTTIME": "19:10:00", "DESTSTATION_NM": "의정부" },
      { "LEFTTIME": "20:05:00", "DESTSTATION_NM": "양주" },
      { "LEFTTIME": "21:15:00", "DESTSTATION_NM": "소요산" },
      { "LEFTTIME": "22:10:00", "DESTSTATION_NM": "의정부" },
      { "LEFTTIME": "23:05:00", "DESTSTATION_NM": "광운대" },
      { "LEFTTIME": "23:45:00", "DESTSTATION_NM": "동묘앞" }
    ],
    "down": [
      { "LEFTTIME": "05:15:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "05:35:00", "DESTSTATION_NM": "서동탄" },
      { "LEFTTIME": "05:50:00", "DESTSTATION_NM": "천안" },
      { "LEFTTIME": "06:08:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "06:22:00", "DESTSTATION_NM": "신창" },
      { "LEFTTIME": "06:40:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "07:10:00", "DESTSTATION_NM": "서동탄" },
      { "LEFTTIME": "07:25:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "07:45:00", "DESTSTATION_NM": "천안" },
      { "LEFTTIME": "08:05:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "09:20:00", "DESTSTATION_NM": "서동탄" },
      { "LEFTTIME": "10:15:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "11:10:00", "DESTSTATION_NM": "신창" },
      { "LEFTTIME": "12:15:00", "DESTSTATION_NM": "천안" },
      { "LEFTTIME": "13:20:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "14:10:00", "DESTSTATION_NM": "서동탄" },
      { "LEFTTIME": "15:15:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "16:20:00", "DESTSTATION_NM": "천안" },
      { "LEFTTIME": "17:10:00", "DESTSTATION_NM": "신창" },
      { "LEFTTIME": "18:25:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "19:15:00", "DESTSTATION_NM": "천안" },
      { "LEFTTIME": "20:20:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "21:10:00", "DESTSTATION_NM": "서동탄" },
      { "LEFTTIME": "22:15:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "23:10:00", "DESTSTATION_NM": "구로" },
      { "LEFTTIME": "23:55:00", "DESTSTATION_NM": "부천" }
    ]
  },
  "2": { // 토요일 (대표 샘플)
    "up": [ { "LEFTTIME": "06:10:00", "DESTSTATION_NM": "소요산" }, { "LEFTTIME": "14:30:00", "DESTSTATION_NM": "광운대" } ],
    "down": [ { "LEFTTIME": "06:15:00", "DESTSTATION_NM": "인천" }, { "LEFTTIME": "14:45:00", "DESTSTATION_NM": "천안" } ]
  },
  "3": { // 공휴일 (대표 샘플)
    "up": [ { "LEFTTIME": "08:10:00", "DESTSTATION_NM": "의정부" }, { "LEFTTIME": "15:30:00", "DESTSTATION_NM": "소요산" } ],
    "down": [ { "LEFTTIME": "08:15:00", "DESTSTATION_NM": "서동탄" }, { "LEFTTIME": "15:45:00", "DESTSTATION_NM": "인천" } ]
  }
};
