import produce from 'immer';
import { fullBuildIDToDate } from './build-id-utils';
import { nearestBelow } from './stats';

export function sortByKey(key) {
  return (a, b) => {
    if (a[key] <= b[key]) return -1;
    if (a[key] > b[key]) return 1;
    return 0;
  };
}

export const responseHistogramToGraphicFormat = (
  histogram,
  keyTransform = (k) => +k
) => {
  // turn histogram to array of objects, sorted.
  const formatted = Object.entries(histogram).map(([k, v]) => ({
    bin: keyTransform(k),
    value: v,
  }));
  formatted.sort((a, b) => {
    if (a.key > b.key) return -1;
    if (a.key <= b.key) return 1;
    return 0;
  });
  return formatted;
};

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
};

function createNewError(which) {
  const error = new Error(errors[which].message);
  error.moreInformation = errors[which].moreInformation;
  return error;
}

export const prepareForQuantilePlot = (probeData, key = 'version') =>
  probeData.map((probe) => {
    const h = probe.histogram;
    if (!h) {
      throw createNewError('MISSING_HISTOGRAM');
    }
    const histogram = responseHistogramToGraphicFormat(h);
    const { percentiles } = probe;

    if (!percentiles) {
      throw createNewError('MISSING_PERCENTILES');
    }

    // fixme: remove need for transformedPercentiles.
    const transformedPercentiles = Object.entries(percentiles).reduce(
      (acc, [bin, value]) => {
        // eslint-disable-next-line no-param-reassign
        acc[bin] = nearestBelow(
          value,
          histogram.map((hi) => hi.bin)
        );
        return acc;
      },
      {}
    );
    return {
      ...probe,
      label: key === 'version' ? probe[key] : fullBuildIDToDate(probe[key]),
      histogram,
      percentiles,
      transformedPercentiles,
      version: probe.version,
      audienceSize: probe.total_users,
    };
  });

function toProportions(obj) {
  const proportions = { ...obj };
  const total = Object.values(proportions).reduce((a, b) => a + b, 0);
  Object.keys(proportions).forEach((p) => {
    proportions[p] /= total;
  });
  return proportions;
}

// export function topKBuildsPerDay(dataset, k = 2) {
//   const byBuildID = groupBy(dataset, 'label', formatBuildIDToOnlyDate);
//   const topK = Object.values(byBuildID).map((matches) => {
//     const out = matches;
//     out.sort(sortByKey('audienceSize'));
//     out.reverse();
//     return out.slice(0, k);
//   });
//   const flattened = topK.flat(2);
//   flattened.sort(sortByKey('label'));
//   return flattened;
// }

export const prepareForProportionPlot = (
  probeData,
  key = 'version',
  prepareArgs = {}
) =>
  probeData.map((probe) => {
    const counts = { ...probe.histogram };
    if (prepareArgs.probeType === 'histogram-boolean') {
      counts.no = counts['0'];
      counts.yes = counts['1'];
      delete counts['0'];
      delete counts['1'];
      delete counts['2'];
    }
    const proportions = toProportions(counts);
    return {
      label: key === 'version' ? probe[key] : fullBuildIDToDate(probe[key]),
      counts,
      version: probe.version,
      proportions,
      audienceSize: probe.total_users,
    };
  });

export function transformResponse(
  d,
  preparationType = 'quantile',
  aggregationLevel = 'build_id',
  prepareArgs = {}
) {
  const prepareFcn =
    preparationType === 'quantile'
      ? prepareForQuantilePlot
      : prepareForProportionPlot;

  const data = prepareFcn(
    produce(d, (di) => di),
    aggregationLevel,
    prepareArgs
  );
  data.sort(sortByKey('label'));
  return data;
}

function typeAndKind(probeType, probeKind) {
  return (matchType, matchKind) =>
    probeType === matchType && probeKind === matchKind;
}

export function getProbeViewType(probeType, probeKind) {
  const m = typeAndKind(probeType, probeKind);
  // histogram blocks
  if (m('histogram', 'linear')) return 'histogram';
  if (m('histogram', 'exponential')) return 'histogram';
  // scalar (hist rep) blocks FIXME: maybe conflate w/ histogram
  if (m('scalar', 'uint')) return 'scalar';
  // categorical blocks
  if (m('scalar', 'boolean')) return 'categorical';
  if (m('histogram', 'enumerated')) return 'categorical';
  if (m('histogram', 'categorical')) return 'categorical';
  if (m('histogram', 'flag')) return 'categorical';
  if (m('histogram', 'boolean')) return 'categorical';
  if (m('histogram', 'count')) return 'categorical';
  return undefined;
}

export function clientCounts(arr) {
  return arr.map((a) => ({ totalClients: a.audienceSize, label: a.label }));
}

export function isSelectedProcessValid(processes, selectedProcess) {
  let process = selectedProcess;
  if (process === 'all_childs') {
    process = 'main';
  }
  if (process === 'parent') {
    process = 'main';
  }

  return processes.includes(process);
}
