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
    if (a[key] <= b[key]) return -1;
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

export function checkForHistogram(point) {
  if (point.histogram === undefined) {
    throw createNewError('MISSING_HISTOGRAM');
  }
}

export function checkForPercentiles(point) {
  if (point.percentiles === undefined) {
    throw createNewError('MISSING_PERCENTILES');
  }
}

export function checkForTotalUsers(point) {
  if (point.total_users === undefined) {
    throw createNewError('MISSING_TOTAL_USERS');
  }
}

/* quantile view transform functions */

export function addProportion(point) {
  // requires point.histogram.
  point.proportions = { ...point.histogram };
}

export function changeBooleanHistogramResponse(point) {
  // requires addProportion to be called first.
  point.histogram.no = point.histogram['0'];
  point.histogram.yes = point.histogram['1'];
  delete point.histogram['0'];
  delete point.histogram['1'];
  delete point.histogram['2'];
}

export function proportionsToCounts(point) {
  point.counts = {};
  Object.keys(point.proportions).forEach((p) => {
    point.counts[p] = point.proportions[p] * point.total_users;
  });
}

export function toAudienceSize(point) {
  point.audienceSize = point.total_users;
}

export const makeLabel = {
  version(pt) {
    pt.label = pt.version;
  },
  build_id(pt) {
    if (pt.build_date) {
      pt.label = buildDateStringToDate(pt.build_date.slice(0, 18));
    } else {
      // if no build_date, let's attempt to use build_id instead.
      // This is the current flow for Firefox Desktop.
      // Add a build_date field here if one does not exist.
      pt.label = fullBuildIDToDate(pt.build_id);
      pt.build_date = new Date(pt.label);
    }
  },
};

/* quantile view transform functions */

export const responseHistogramToGraphicFormat = (
  point,
  keyTransform = (k) => +k
) => {
  // turn histogram to array of objects, sorted.
  const formatted = Object.entries(point.histogram).map(([k, v]) => ({
    bin: keyTransform(k),
    value: v,
  }));
  formatted.sort((a, b) => {
    if (a.key > b.key) return -1;
    if (a.key <= b.key) return 1;
    return 0;
  });
  point.histogram = formatted;
};

export function transformedPercentiles(point) {
  // requires responseHistogramToGraphicFormat to be run first
  point.transformedPercentiles = Object.entries(point.percentiles).reduce(
    (acc, [bin, value]) => {
      // eslint-disable-next-line no-param-reassign
      acc[bin] = nearestBelow(
        value,
        point.histogram.map((hi) => hi.bin)
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
      ...standardProportionTransformations,
      makeLabel[aggregationLevel]
    );
    const transformed = [...tr(data)];
    transformed.sort(sortByKey('label'));
    return transformed;
  },
};
