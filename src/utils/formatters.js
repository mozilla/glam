import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';

export const formatValue = format(',.2f');
export const formatPercent = format('.3%');
export const formatPercentNoDecimal = format('.0%');
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

export const formatCompact = (t) =>
  Intl.NumberFormat('en', { notation: 'compact' }).format(t);

export const formatBuildIDToDateString = (b) => timeFormat('%Y-%m-%d %H')(b);
export const ymd = timeFormat('%Y-%m-%d');
export const timecode = timeFormat('%H:%M:%S');
export const formatBuildIDToOnlyDate = (b) => ymd(b);
export const formatToBuildID = timeFormat('%Y%m%d%H%M%S');

// Glean's supported time_units for timing_distribution / labeled_timing_distribution
// / timespan. Values are always recorded in nanoseconds; time_unit is the unit
// the metric author asked the value to be reported in.
const TIME_UNITS_FROM_NS = {
  nanosecond: { divisor: 1, suffix: 'ns' },
  microsecond: { divisor: 1e3, suffix: 'μs' },
  millisecond: { divisor: 1e6, suffix: 'ms' },
  second: { divisor: 1e9, suffix: 's' },
  minute: { divisor: 6e10, suffix: 'min' },
  hour: { divisor: 3.6e12, suffix: 'h' },
  day: { divisor: 8.64e13, suffix: 'd' },
};

export const formatFromNanoseconds = (v, timeUnit) => {
  const unit = TIME_UNITS_FROM_NS[timeUnit];
  if (unit) {
    return `${formatCompact(v / unit.divisor)} ${unit.suffix}`;
  }
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
