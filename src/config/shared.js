import { createCatColorMap } from '../utils/color-maps';

export const numHighlightedBuckets = 10;

export const makeSortOrder =
  (latest, which = 'counts') =>
  (a, b) => {
    // get latest data point and see
    if (latest[which][a] < latest[which][b]) return 1;
    if (latest[which][a] > latest[which][b]) return -1;
    return 0;
  };

export function latestDatapoint(tr) {
  return tr[tr.length - 1];
}

export function getBucketKeys(tr) {
  return Object.keys(latestDatapoint(tr).counts);
}

export function getPercentileName(type) {
  return type === 'normalized' ? 'percentiles' : 'non_norm_percentiles';
}

export function getHistogramName(type) {
  return type === 'normalized' ? 'histogram' : 'non_norm_histogram';
}

export function extractBucketMetadata(transformedData) {
  const etc = {};
  const options = getBucketKeys(transformedData);

  const cmpBuckets = getBucketKeys(transformedData);
  const sorter = makeSortOrder(latestDatapoint(transformedData));
  cmpBuckets.sort(sorter);
  const cmp = createCatColorMap(cmpBuckets);
  const initialBuckets = cmpBuckets.slice(0, numHighlightedBuckets);
  etc.bucketOptions = options;
  etc.bucketColorMap = cmp;
  etc.initialBuckets = initialBuckets;
  etc.bucketSortOrder = sorter;
  return etc;
}

export default {
  activeBuckets: {
    isMulti: true,
    defaultValue: [],
  },
  proportionMetricType: {
    defaultValue: 'proportions',
  },
  timeHorizon: {
    defaultValue: 'MONTH',
  },
  visiblePercentiles: {
    isMulti: true,
    defaultValue: [95, 75, 50, 25, 5],
  },
};
