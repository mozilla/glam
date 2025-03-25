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
import { convertValueToProportions } from './probe-utils';

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

  // draft.non_norm_histogram is not in proportion format
  // like draft.histogram so we need to convert it here
  draft.non_norm_proportions = convertValueToProportions(
    draft.non_norm_histogram
  );
}

export function changeBooleanHistogramResponse(draft) {
  // requires addProportion to be called first.
  draft.histogram.no = draft.histogram['0'];
  draft.histogram.yes = draft.histogram['1'];
  delete draft.histogram['0'];
  delete draft.histogram['1'];
  delete draft.histogram['2'];
}

export function proportionsToCounts(draft) {
  draft.counts = {};
  Object.keys(draft.proportions).forEach((p) => {
    draft.counts[p] = draft.proportions[p] * draft.total_users;
  });
  draft.non_norm_counts = {};
  Object.keys(draft.non_norm_proportions).forEach((p) => {
    draft.non_norm_counts[p] =
      draft.non_norm_proportions[p] * draft.total_users;
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
  if (draft.non_norm_histogram) {
    // e.g. older builds don't have non normalized data
    const formattedNonNormalized = Object.entries(draft.non_norm_histogram).map(
      ([k, v]) => ({
        bin: keyTransform(k),
        value: v,
      })
    );
    formattedNonNormalized.sort((a, b) => {
      if (a.key > b.key) return -1;
      if (a.key < b.key) return 1;
      return 0;
    });
    draft.non_norm_histogram = formattedNonNormalized;
  }
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
  if (draft.non_norm_percentiles && draft.non_norm_histogram)
    draft.transformedNonNormPercentiles = Object.entries(
      draft.non_norm_percentiles
    ).reduce((acc, [bin, value]) => {
      acc[bin] = nearestBelow(
        value,
        draft.non_norm_histogram.map((hi) => hi.bin)
      );
      return acc;
    }, {});
}

export const standardProportionTransformations = [
  checkForHistogram,
  checkForTotalUsers,
  toAudienceSize,
  addProportion,
  proportionsToCounts,
  responseHistogramToGraphicFormat,
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
      ...standardProportionTransformations,
      makeLabel[aggregationLevel]
    );
    const transformed = [...tr(data)];
    transformed.sort(sortByKey('label'));
    return transformed;
  },
};

/**
 * Transforms labeled counter data into a categorical histogram format.
 * This transformation would ideally be done on the ETL, but given the amount
 * of work involved in changing the ETL, we are doing it here.
 *
 * @description
 * 1. Calculates the total number of users per build (`clientsPerBuild`).
 * 2. Reverses the `labels` object to map labels back to their metric keys (`revertedLabels`).
 * 3. Initializes histograms for each label with zero values (`initHistograms`).
 * 4. Constructs normalized and non-normalized histograms for each build (`histogramsPerBuild`).
 * 5. Transforms the input data by adding histogram data, total users, and a constant metric key.
 * 6. Filters the transformed data to include only points with `client_agg_type` equal to 'count'.
 * 7. Ensures the returned array contains unique entries for each `build_id`.
 */
export const transformLabeledCounterToCategoricalHistogram = (data, labels) => {
  /* eslint-disable camelcase */
  const clientsPerBuild = data
    .filter((point) => point.client_agg_type === 'count')
    .reduce((acc, { build_id, total_users }) => {
      if (!acc[build_id]) {
        acc[build_id] = 0;
      }
      acc[build_id] += total_users;
      return acc;
    }, {});

  const revertedLabels = Object.entries(labels).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {});

  const initHistograms = Object.keys(labels).reduce(
    (innerAcc, key) => ({
      ...innerAcc,
      [key]: 0,
    }),
    {}
  );

  const histogramsPerBuild = data.reduce(
    (acc, { build_id, metric_key, total_users }) => {
      if (!acc[build_id]) {
        acc[build_id] = {
          normalized: { ...initHistograms },
          non_normalized: { ...initHistograms },
        };
      }
      acc[build_id].normalized[revertedLabels[metric_key]] =
        total_users / clientsPerBuild[build_id];
      acc[build_id].non_normalized[revertedLabels[metric_key]] = total_users;
      return acc;
    },
    {}
  );

  const transformed = produce(data, (draft) =>
    draft.map((point) => ({
      ...point,
      histogram: histogramsPerBuild[point.build_id].normalized,
      non_norm_histogram: histogramsPerBuild[point.build_id].non_normalized,
      total_users: clientsPerBuild[point.build_id],
      metric_key: 'single',
    }))
  ).filter((point) => point.client_agg_type === 'count');

  const uniqueTransformed = transformed.filter(
    (point, index, self) =>
      index === self.findIndex((p) => p.build_id === point.build_id)
  );

  return uniqueTransformed;
};
