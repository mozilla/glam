// taken from d3-array
function c(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}
export function firstIndexAbove({
  value, data, key = 'label', lo = 0, hi = data.length,
}) {
  while (lo < hi) {
    const mid = lo + hi >>> 1; // eslint-disable-line
    if (c(+data[mid][key], value) < 0) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function previousCurrentNext({
  value, data, key = 'label', lowestValue = -Infinity, highestValue = Infinity,
}) {
  const lo = firstIndexAbove({ data, value: lowestValue, key });
  const hi = firstIndexAbove({ data, value: highestValue, key });
  let index;
  let previous;
  const candidate = firstIndexAbove({ value, data, key });
  if (candidate === 0) {
    previous = candidate;
    index = candidate;
  } else {
    const pv = value - data[candidate - 1][key];
    const distance = data[candidate][key] - data[candidate - 1][key];
    if (pv > distance / 2) {
      index = candidate;
    } else {
      index = candidate - 1;
    }
    previous = Math.max(lo, index - 1);
  }
  const next = Math.min(hi - 1, index + 1);
  return [previous, index, next];
}

export function get1DWindow({
  value, data, key = 'label', lowestValue = -Infinity, highestValue = Infinity,
  pad = 0.5, scale = (x) => x,
}) {
  const [previous, index, next] = previousCurrentNext({
    value, data, key, lowestValue, highestValue,
  });
  const p = data[previous];
  const i = data[index];
  const n = data[next];
  const leftWindow = (i[key] - p[key]) * pad;
  const start = i[key] - leftWindow;
  const rightWindow = (n[key] - i[key]) * pad;
  const end = i[key] + rightWindow;
  const width = end - start;
  return {
    start,
    end,
    width,
    rangeStart: scale(start),
    rangeEnd: scale(end),
    rangeWidth: scale(end) - scale(start),
  };
}
