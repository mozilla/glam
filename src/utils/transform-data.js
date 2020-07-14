import produce from 'immer';
import { fullBuildIDToDate, buildDateStringToDate } from './build-id-utils';
import { nearestBelow } from './stats';

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
      // add a build_date field here if one does not exist.
      // this should match
      pt.label = fullBuildIDToDate(pt.build_id);
      pt.build_date = new Date(pt.label);
    }
  },
};

/// ///////

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
  toAudienceSize,
  addProportion,
  proportionsToCounts,
];

export const standardQuantileTransformations = [
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
