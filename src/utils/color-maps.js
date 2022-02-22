import { schemeTableau10 } from 'd3-scale-chromatic';

export function percentileLineColorMap(percentile) {
  const p = +percentile;
  if (p === 0.1) return 'var(--pond-green-200)';
  if (p === 1) return 'var(--blue-slate-150)';
  if (p === 5) return 'var(--digital-blue-250)';
  if (p === 25) return 'var(--digital-blue-500)';
  if (p === 50) return 'var(--cool-gray-600)';
  if (p === 75) return 'var(--pantone-red-500)';
  if (p === 95) return 'var(--pantone-red-300)';
  if (p === 99) return 'var(--pond-green-500)';
  if (p === 99.9) return 'var(--blue-slate-600)';
  return 'black';
}

export function percentileLineStrokewidthMap(percentile) {
  if (percentile === 50) return 1.5;
  return 1;
}

export function createCatColorMap(options) {
  const getID = (value) => options.findIndex((v) => v === value);
  return function catColorMap(v) {
    const i = getID(v);
    if (i >= 10 || i === undefined) {
      return 'var(--cool-gray-300)';
    }
    return schemeTableau10[i];
  };
}

export function genericCategoricalColorMap(v) {
  return schemeTableau10[v];
}
