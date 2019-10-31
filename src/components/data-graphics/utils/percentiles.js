// FIXME: we need to move all these different utility functions into a shared
// directory.

/* eslint-disable import/prefer-default-export */

export function extractPercentiles(percentileValues, convertedData, which = 'percentiles') {
  return percentileValues
    .map((percentileBin) => convertedData.map((data) => {
      const value = data[which][percentileBin];
      return {
        label: data.label,
        bin: percentileBin,
        value,
      };
    }));
}
