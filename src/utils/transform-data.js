/*
transform-data.js
=================
This file defines functions used for transforming the API response
just enough to be used by GLAM. The function transform
creates a deep copy of the API response data, and then applies
each function in the arguments to each data point in the response. The functions
all MUTATE the deep-copied API response using immer's produce. This is a much
easier way to reason about what needs to be done to the data and reduces the cost
of the transformation.

A transform pipeline accepts any number of arguments, each of which must either
be falsy or a function. If the value is falsy, transform skips it.
Some transform functions are checks that, if they fail, throw an error.
*/

import produce from 'immer';
import { fullBuildIDToDate, buildDateStringToDate } from './build-id-utils';
import { nearestBelow } from './stats';

const errors = {
  MISSING_PERCENTILES: {
    message: 'This probe is missing data.',
    moreInformation:
      "We can't find the percentile calculations for this probe.",
  },
  MISSING_HISTOGRAM: {
    message: 'This probe is missing data.',
    moreInformation: "We can't find the histogram aggregations for this probe.",
  },
  MISSING_TOTAL_USERS: {
    message: 'This probe is missing data.',
    moreInformation: "We can't find the total user counts for this probe.",
  },
};

function createNewError(which) {
  const error = new Error(errors[which].message);
  error.moreInformation = errors[which].moreInformation;
  return error;
}

export function sortByKey(key) {
  return (a, b) => {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
    return 0;
  };
}

export function transform(...transforms) {
  if (
    !transforms.map((tr) => typeof tr === 'function' || !tr).every((v) => v)
  ) {
    throw Error('transforms must be a function or falsy');
  }
  return produce((draft) => {
    draft.forEach((point) => {
      transforms.reduce((acc, v) => {
        if (v) v(acc);
        return acc;
      }, point);
    });
  });
}

/*
The following functions are used in transform.
Each of these mutates a single data point.
*/

export function checkForHistogram(draft) {
  if (draft.histogram === undefined) {
    throw createNewError('MISSING_HISTOGRAM');
  }
}

export function checkForPercentiles(draft) {
  if (draft.percentiles === undefined) {
    throw createNewError('MISSING_PERCENTILES');
  }
}

export function checkForTotalUsers(draft) {
  if (draft.total_users === undefined) {
    throw createNewError('MISSING_TOTAL_USERS');
  }
}

/* proportion view transform functions */

export function addProportion(draft) {
  // requires point.histogram.
  draft.proportions = { ...draft.histogram };
}

export function changeBooleanHistogramResponse(draft) {
  // requires addProportion to be called first.
  draft.histogram.no = draft.histogram['0'];
  draft.histogram.yes = draft.histogram['1'];
  delete draft.histogram['0'];
  delete draft.histogram['1'];
  delete draft.histogram['2'];
}

export function attachHistogramLabels(draft) {
  // TODO: Get labels from:
  //   { ...appStore.getState().probe.info.calculated.latest_history.details.labels };
  const labels = {0: 'restart', 1: 'available', 2: 'manual', 3: 'unsupported'};
  draft.histogram = Object.entries(draft.histogram).reduce(
    (acc, [bin, value]) => {
      if (bin in labels) {
        acc[labels[bin]] = value;
      }
      return acc;
    },
    {}
  );
}

export function proportionsToCounts(draft) {
  draft.counts = {};
  Object.keys(draft.proportions).forEach((p) => {
    draft.counts[p] = draft.proportions[p] * draft.total_users;
  });
}

export function toAudienceSize(draft) {
  draft.audienceSize = draft.total_users;
}

export const makeLabel = {
  version(draft) {
    draft.label = draft.version;
  },
  build_id(draft) {
    if (draft.build_date) {
      draft.label = buildDateStringToDate(draft.build_date.slice(0, 18));
    } else {
      // if no build_date, let's attempt to use build_id instead.
      // This is the current flow for Firefox Desktop.
      // Add a build_date field here if one does not exist.
      draft.label = fullBuildIDToDate(draft.build_id);
      draft.build_date = new Date(draft.label);
    }
  },
};

/* quantile view transform functions */

export const responseHistogramToGraphicFormat = (
  draft,
  keyTransform = (k) => +k
) => {
  // turn histogram to array of objects, sorted.
  const formatted = Object.entries(draft.histogram).map(([k, v]) => ({
    bin: keyTransform(k),
    value: v,
  }));
  formatted.sort((a, b) => {
    if (a.key > b.key) return -1;
    if (a.key < b.key) return 1;
    return 0;
  });
  draft.histogram = formatted;
};

export function transformedPercentiles(draft) {
  // requires responseHistogramToGraphicFormat to be run first
  draft.transformedPercentiles = Object.entries(draft.percentiles).reduce(
    (acc, [bin, value]) => {
      acc[bin] = nearestBelow(
        value,
        draft.histogram.map((hi) => hi.bin)
      );
      return acc;
    },
    {}
  );
}

export const standardProportionTransformations = [
  checkForHistogram,
  checkForTotalUsers,
  toAudienceSize,
  addProportion,
  proportionsToCounts,
];

export const standardQuantileTransformations = [
  checkForHistogram,
  checkForPercentiles,
  checkForTotalUsers,
  toAudienceSize,
  responseHistogramToGraphicFormat,
  transformedPercentiles,
];

export const transformAPIResponse = {
  quantile(data, aggregationLevel) {
    const tr = transform(
      ...standardQuantileTransformations,
      makeLabel[aggregationLevel]
    );
    const transformed = [...tr(data)];
    transformed.sort(sortByKey('label'));
    return transformed;
  },
  proportion(data, aggregationLevel, probeType) {
    const tr = transform(
      // remove unused fields for histogram-boolean probe types (firefox desktop)
      probeType === 'histogram-boolean' && changeBooleanHistogramResponse,
      probeType === 'histogram-categorical' && attachHistogramLabels,
      ...standardProportionTransformations,
      makeLabel[aggregationLevel]
    );
    const transformed = [...tr(data)];
    transformed.sort(sortByKey('label'));
    return transformed;
  },
};
