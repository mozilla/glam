export const setField = (field, value) => (draft) => { draft[field] = value; };

export const setProbe = (probe) => setField('probe', probe);
export const setProduct = (product) => setField('product', product);
export const setChannel = (channel) => setField('channel', channel);
export const setOS = (os) => setField('os', os);
export const setAggregationLevel = (aggregationLevel) => setField('aggregationLevel', aggregationLevel);
export const setSearchIsActive = (tf) => setField('searchIsActive', tf);
export const setApplicationStatus = (status) => setField('applicationStatus', status);
export const setVisiblePercentiles = (percentileArray) => setField('visiblePercentiles', percentileArray);
export const setTimeHorizon = (timeHorizon) => setField('timeHorizon', timeHorizon);
export const setProportionMetricType = (metricType) => setField('proportionMetricType', metricType);
export const setActiveBuckets = (arrayOfBucketKeys) => setField('activeBuckets', arrayOfBucketKeys);
export const setDashboardMode = (msg) => setField('dashboardMode', msg);

export const setSearchQuery = (query) => (draft) => {
  draft.searchQuery = query;
  setSearchIsActive(true)(draft);
};
