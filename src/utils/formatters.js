import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';

export const formatValue = format(',.2f');
export const formatPercent = format('.0%');
export const formatPercentDecimal = format('.2%');
export const formatCount = format(',d');
export const formatSignCount = format('+,d');

export const formatParenPercent = (fmt, v, pad = 0) => {
  let p = '';
  const f = `(${format(fmt)(v)})`;
  if (f.length < pad) {
    p = ' '.repeat(pad - f.length);
  }
  return `${p}${f}`;
};

export const formatBuildIDToDateString = (b) => timeFormat('%Y-%m-%d %H')(b);
export const ymd = timeFormat('%Y-%m-%d');
export const timecode = timeFormat('%H:%M:%S');
export const formatBuildIDToOnlyDate = (b) => ymd(b);
export const formatToBuildID = timeFormat('%Y%m%d%H%M%S');
