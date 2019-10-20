// FIXME: we need to move all these different utility functions into a shared
// directory.

import { nearestBelow } from '../../../utils/stats';
/* eslint-disable import/prefer-default-export */

export function extractPercentiles(percentileValues, convertedData) {
  return percentileValues
    .map((percentile) => convertedData.map(({ label, percentiles, histogram }) => {
      const histKeys = histogram.map((h) => h.bin);
      const originalPercentileValue = percentiles.find((p) => p.bin === percentile).value;
      return {
        label,
        value:
        nearestBelow(originalPercentileValue, histKeys),
        originalPercentileValue,
      };
    }));
}
