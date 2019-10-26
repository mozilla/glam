// FIXME: we need to move all these different utility functions into a shared
// directory.

import { nearestBelow } from '../../../utils/stats';
/* eslint-disable import/prefer-default-export */

export function extractPercentiles(percentileValues, convertedData) {
  return percentileValues
    .map((percentileBin) => convertedData.map(({
      label, percentiles, transformedPercentiles,
    }) => {
      const percentile = percentiles[percentileBin];
      const transformedPercentile = transformedPercentiles[percentileBin];
      return {
        label,
        percentile,
        transformedPercentile,
      };
    }));
}
