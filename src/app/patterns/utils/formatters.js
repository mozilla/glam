import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';

export const formatValue = format(',.2f');
export const formatPercent = format('.0%');
export const formatCount = format(',d');
// export const formatBuildIDToDateString = (b) => `${b.slice(0, 4)}-${b.slice(4, 6)}-${b.slice(6, 8)} ${b.slice(8, 10)}h`;
export const formatBuildIDToDateString = (b) => timeFormat('%Y-%m-%d %H')(b);
const ymd = timeFormat('%Y-%m-%d');
export const formatBuildIDToOnlyDate = (b) => ymd(b);
export const formatToBuildID = timeFormat('%Y%m%d%H%M%S');
// export const formatBuildIDToOnlyDate = (b) => {
//   const y = b.getFullYear();
//   const m = b.getMonth() + 1;
//   const d = b.getDate();
//   return `${y}-${m}-${d}`;
// };
