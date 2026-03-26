export const SUBWAY_LINE_COLORS = {
  '1호선': '#3D53B3',
  '01호선': '#3D53B3',
  '2호선': '#4ab54d',
  '02호선': '#4ab54d',
  '3호선': '#f68230',
  '03호선': '#f68230',
  '4호선': '#6cbce5',
  '04호선': '#6cbce5',
  '5호선': '#8445cc',
  '05호선': '#8445cc'
};

export function getSubwayLineColor(line) {
  return SUBWAY_LINE_COLORS[String(line || '').trim()] || '#3D53B3';
}
