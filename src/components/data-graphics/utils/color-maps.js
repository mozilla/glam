/* eslint-disable import/prefer-default-export */

export function percentileLineColorMap(percentile) {
  if (percentile === 5) return 'var(--digital-blue-300)';
  if (percentile === 25) return 'var(--digital-blue-500)';
  if (percentile === 50) return 'var(--cool-gray-600)';
  if (percentile === 75) return 'var(--pantone-red-500)';
  if (percentile === 95) return 'var(--pantone-red-300)';
  return 'black';
}

export function percentileLineStrokewidthMap(percentile) {
  if (percentile === 50) return 1.5;
  return 1;
}
