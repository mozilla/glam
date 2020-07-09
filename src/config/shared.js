import { createCatColorMap } from '../utils/color-maps';

export const numHighlightedBuckets = 10;

export const makeSortOrder = (latest, which = 'counts') => (a, b) => {
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
