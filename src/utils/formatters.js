import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';

export const formatValue = format(',.2f');
export const formatPercent = format('.3%');
export const formatPercentDecimal = format('.2%');
export const formatCount = format(',d');
export const formatMetric = format(',.2s');
export const formatSignCount = format('+,d');

export const formatParenPercent = (fmt, v, pad = 0) => {
  let p = '';
  const f = `(${format(fmt)(v)})`;
  if (f.length < pad) {
    p = ' '.repeat(pad - f.length);
  }
  return `${p}${f}`;
};

export const formatMillion = (num) =>
  // format a number as '1mil' if a million or more
  Math.abs(num) > 999999
    ? `${format(',d')(
        Math.sign(num) * (Math.abs(num) / 1000000).toFixed(1)
      )}mil`
    : format(',d')(Math.sign(num) * Math.abs(num));

export const formatBuildIDToDateString = (b) => timeFormat('%Y-%m-%d %H')(b);
export const ymd = timeFormat('%Y-%m-%d');
export const timecode = timeFormat('%H:%M:%S');
export const formatBuildIDToOnlyDate = (b) => ymd(b);
export const formatToBuildID = timeFormat('%Y%m%d%H%M%S');

export const formatFromNanoseconds = (v) => {
  if (v < 1e3) {
    return `${format(',d')(v)} ns`;
  }
  if (v < 1e6) {
    return `${format(',d')(v / 1e3)} μs`;
  }
  if (v < 1e9) {
    return `${format(',d')(v / 1e6)} ms`;
  }

  return `${format(',.2')(v / 1e9)} s`;
};
