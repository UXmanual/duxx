/**
 * [Data] 서울역 1호선 대표 시간표 (내장 데이터)
 * @description API 연동 불가 시 또는 캐싱용으로 사용되는 평일/토요일/공휴일 대표 시간표
 * 출처: 서울시 공공 데이터 포털 (대표 시간표 기준)
 */
export const SEOUL_STATION_TIMETABLE_STATIC = {
  "1": { // 평일 (Seoul Station Line 1)
    "up": [
      { "LEFTTIME": "05:20:00", "DESTSTATION_NM": "소요산" },
      { "LEFTTIME": "05:39:00", "DESTSTATION_NM": "의정부" },
      { "LEFTTIME": "05:51:00", "DESTSTATION_NM": "동두천" },
      { "LEFTTIME": "06:04:00", "DESTSTATION_NM": "의정부" },
      { "LEFTTIME": "06:16:00", "DESTSTATION_NM": "양주" },
      { "LEFTTIME": "06:29:00", "DESTSTATION_NM": "소요산" },
      { "LEFTTIME": "06:40:00", "DESTSTATION_NM": "의정부" },
      { "LEFTTIME": "06:51:00", "DESTSTATION_NM": "광운대" },
      { "LEFTTIME": "07:05:00", "DESTSTATION_NM": "소요산" },
      { "LEFTTIME": "07:18:00", "DESTSTATION_NM": "의정부" },
      { "LEFTTIME": "07:30:00", "DESTSTATION_NM": "양주" },
      { "LEFTTIME": "07:39:00", "DESTSTATION_NM": "동두천" },
      { "LEFTTIME": "14:12:00", "DESTSTATION_NM": "의정부" },
      { "LEFTTIME": "14:32:00", "DESTSTATION_NM": "소요산" },
      { "LEFTTIME": "14:55:00", "DESTSTATION_NM": "광운대" },
      { "LEFTTIME": "15:15:00", "DESTSTATION_NM": "의정부" },
      { "LEFTTIME": "15:32:00", "DESTSTATION_NM": "양주" },
      { "LEFTTIME": "15:48:00", "DESTSTATION_NM": "소요산" },
      { "LEFTTIME": "23:05:00", "DESTSTATION_NM": "광운대" },
      { "LEFTTIME": "23:25:00", "DESTSTATION_NM": "의정부" },
      { "LEFTTIME": "23:45:00", "DESTSTATION_NM": "동묘앞" }
    ],
    "down": [
      { "LEFTTIME": "05:19:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "05:35:00", "DESTSTATION_NM": "천안" },
      { "LEFTTIME": "05:54:00", "DESTSTATION_NM": "신창" },
      { "LEFTTIME": "06:06:00", "DESTSTATION_NM": "서동탄" },
      { "LEFTTIME": "06:17:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "06:30:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "06:42:00", "DESTSTATION_NM": "천안" },
      { "LEFTTIME": "06:55:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "07:08:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "07:22:00", "DESTSTATION_NM": "신창" },
      { "LEFTTIME": "07:35:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "07:48:00", "DESTSTATION_NM": "서동탄" },
      { "LEFTTIME": "14:05:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "14:25:00", "DESTSTATION_NM": "천안" },
      { "LEFTTIME": "14:48:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "15:08:00", "DESTSTATION_NM": "신창" },
      { "LEFTTIME": "15:28:00", "DESTSTATION_NM": "서동탄" },
      { "LEFTTIME": "15:45:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "23:15:00", "DESTSTATION_NM": "인천" },
      { "LEFTTIME": "23:35:00", "DESTSTATION_NM": "구로" },
      { "LEFTTIME": "23:55:00", "DESTSTATION_NM": "병점" }
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
