
export const updateField = (field, value) => (draft) => {
  draft[field] = value;
};

export const updateProbe = (probe) => updateField('probe', probe);
export const updateProduct = (product) => updateField('product', product);
export const updateChannel = (channel) => updateField('channel', channel);
export const updateOS = (os) => updateField('os', os);
export const updateAggregationLevel = (aggregationLevel) => updateField('aggregationLevel', aggregationLevel);

// search
export const updateSearchIsActive = (tf) => (draft) => { draft.searchIsActive = tf; };

export const updateSearchQuery = (query) => (draft) => {
  draft.searchQuery = query;
  updateSearchIsActive(true)(draft);
};

// FIXME: we should be using this pattern for other actions, where appropriate.
// this lets us namespace a bit more easily.

function createActionSet(key, defaultValue) {
  return {
    set: (value) => updateField(key, value),
    reset: () => updateField(key, defaultValue),
    defaultValue,
  };
}

export const applicationStatus = createActionSet('applicationStatus', 'INITIALIZING');
export const visiblePercentiles = createActionSet('visiblePercentiles', [5, 25, 50, 75, 95]);
export const timeHorizon = createActionSet('timeHorizon', 'MONTH');
export const proportionMetricType = createActionSet('proportionMetricType', 'proportions');
export const activeBuckets = createActionSet('activeBuckets', []);

export const updateDashboardMode = (msg) => (draft) => {
  draft.dashboardMode = msg;
};
