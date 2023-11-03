import { createCatColorMap } from '../utils/color-maps';

const dataNormalizationNameMap = {
  histogram: {
    non_normalized: 'non_norm_histogram',
    normalized: 'histogram',
  },
  percentiles: {
    non_normalized: 'non_norm_percentiles',
    normalized: 'percentiles',
  },
};

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

export function getPercentileName(type = 'normalized') {
  if (!Object.hasOwn(dataNormalizationNameMap.percentiles, type)) {
    throw new Error(`Unknown normalization type: ${type}`);
  }
  return dataNormalizationNameMap.percentiles[type];
}

export function getTransformedPercentileName(type = 'normalized') {
  if (!Object.hasOwn(dataNormalizationNameMap.percentiles, type)) {
    throw new Error(`Unknown normalization type: ${type}`);
  }
  return type === 'normalized'
    ? 'transformedPercentiles'
    : 'transformedNonNormPercentiles';
}
export function getHistogramName(type = 'normalized') {
  if (!Object.hasOwn(dataNormalizationNameMap.histogram, type)) {
    throw new Error(`Unknown normalization type: ${type}`);
  }
  return dataNormalizationNameMap.histogram[type];
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
