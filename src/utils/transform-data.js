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

import { produce } from 'immer';
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
  draft.non_norm_histogram.no = draft.non_norm_histogram['0'];
  draft.non_norm_histogram.yes = draft.non_norm_histogram['1'];
  delete draft.non_norm_histogram['0'];
  delete draft.non_norm_histogram['1'];
  delete draft.non_norm_histogram['2'];
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
 * Pivots LEGACY (pre-ETL-migration) scalar-shaped labeled_counter rows into a
 * categorical histogram, one point per build. Each bar is the label's share of
 * submitted samples (`sample_count(label) / Σ sample_count`). Output is keyed by
 * the declared labels (extra/`__other__` keys dropped) so it lines up with the
 * new histogram-shaped rows on a single category axis.
 *
 * This only handles old aggregates produced before static labeled_counters moved
 * to the histogram pipeline; new rows are served pre-aggregated and skip this.
 * It can be removed once all in-window versions have been recomputed.
 */
export const transformLabeledCounterToCategoricalHistogramSampleCount = (
  data,
  labels
) => {
  /* eslint-disable camelcase */
  const filteredData = data.filter((point) => point.client_agg_type === 'sum');
  const samplesPerBuild = filteredData.reduce(
    (acc, { build_id, sample_count }) => {
      acc[build_id] = (acc[build_id] || 0) + sample_count;
      return acc;
    },
    {}
  );
  const maxSampleCountPerBuild = filteredData.reduce(
    (acc, { build_id, sample_count }) => {
      acc[build_id] = Math.max(acc[build_id] || 0, sample_count);
      return acc;
    },
    {}
  );
  const clientsPerBuild = filteredData.reduce(
    (acc, { build_id, total_users }) => {
      acc[build_id] = (acc[build_id] || 0) + total_users;
      return acc;
    },
    {}
  );
  const initHistograms = labels.reduce(
    (acc, label) => ({ ...acc, [label]: 0 }),
    {}
  );
  const histogramsPerBuild = filteredData.reduce(
    (acc, { build_id, metric_key, sample_count }) => {
      if (!acc[build_id]) {
        acc[build_id] = {
          normalized: { ...initHistograms },
          non_normalized: { ...initHistograms },
        };
      }
      if (metric_key in acc[build_id].normalized) {
        acc[build_id].normalized[metric_key] =
          sample_count / Math.max(samplesPerBuild[build_id], 1);
        acc[build_id].non_normalized[metric_key] = sample_count;
      }
      return acc;
    },
    {}
  );
  const transformed = produce(filteredData, (draft) =>
    draft.map((point) => ({
      ...point,
      histogram: histogramsPerBuild[point.build_id].normalized,
      non_norm_histogram: histogramsPerBuild[point.build_id].non_normalized,
      total_users: clientsPerBuild[point.build_id],
      sample_count: maxSampleCountPerBuild[point.build_id],
    }))
  );
  return transformed.filter(
    (point, index, self) =>
      index === self.findIndex((p) => p.build_id === point.build_id)
  );
};

/**
 * Routes static labeled_counter rows to the correct categorical transform and
 * merges them into a single series, rendering against the declared `labels`.
 *
 * - New rows are served pre-aggregated as label-keyed histograms
 *   (`client_agg_type === 'summed_histogram'`) and are reconciled against the
 *   declared labels (missing labels filled with 0, non-declared keys dropped).
 * - Legacy scalar-shaped rows are pivoted via
 *   transformLabeledCounterToCategoricalHistogramSampleCount.
 *
 * Both are emitted with one metric_key/client_agg_type so the chart renders a
 * continuous category axis. During the post-migration transition both shapes can
 * be present at once (refresh recomputes only the latest few versions; no
 * backfill), so this routes per row rather than assuming a single shape.
 */
export const transformLabeledCounterToCategorical = (data, labels) => {
  const toDeclaredLabels = (histogram) => {
    const hist = histogram || {};
    return labels.reduce((acc, label) => {
      acc[label] = label in hist ? hist[label] : 0;
      return acc;
    }, {});
  };

  const newPoints = data
    .filter((point) => point.client_agg_type === 'summed_histogram')
    .map((point) => ({
      ...point,
      histogram: toDeclaredLabels(point.histogram),
      non_norm_histogram: toDeclaredLabels(point.non_norm_histogram),
    }));

  const legacyRows = data.filter(
    (point) => point.client_agg_type !== 'summed_histogram'
  );
  const legacyPoints = legacyRows.length
    ? transformLabeledCounterToCategoricalHistogramSampleCount(
        legacyRows,
        labels
      )
    : [];

  return [...legacyPoints, ...newPoints].map((point) => ({
    ...point,
    metric_key: '',
    client_agg_type: 'summed_histogram',
  }));
};

export const transformBooleanHistogramToCategoricalHistogram = (data) => {
  // Boolean histograms have "always", "never", and "sometimes" values. We need to replace these with numeric values and
  // create a map of the labels to the numeric values into the labels object.
  const numericLabels = {
    0: 'always',
    1: 'never',
    2: 'sometimes',
  };

  const transformedData = produce(data, (draft) => {
    draft.forEach((point) => {
      // eslint-disable-next-line no-param-reassign
      point.histogram = {
        0: point.histogram.always,
        1: point.histogram.never,
        2: point.histogram.sometimes,
      };
      // eslint-disable-next-line no-param-reassign
      point.non_norm_histogram = {
        0: point.non_norm_histogram.always,
        1: point.non_norm_histogram.never,
        2: point.non_norm_histogram.sometimes,
      };
    });
  });

  return {
    data: transformedData,
    labels: numericLabels,
  };
};
