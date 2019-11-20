import produce from "immer";

import { nearestBelow } from "../../utils/stats";

export function sortByKey(key) {
  return (a, b) => {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
    return 0;
  };
}

export const sortByHistogramObjectKey = (a, b) => {
  const ai = +a;
  const bi = +b;
  if (ai < bi) return -1;
  if (ai >= bi) return 1;
  return 0;
};

export const responseHistogramToGraphicFormat = (
  histogram,
  keyTransform = k => +k
) => {
  // turn histogram to array of objects, sorted.
  const formatted = Object.entries(histogram).map(([k, v]) => ({
    bin: keyTransform(k),
    value: v
  }));
  formatted.sort((a, b) => {
    if (a.key > b.key) return -1;
    if (a.key <= b.key) return 1;
    return 0;
  });
  return formatted;
};

export const prepareForQuantilePlot = (probeData, key = "version") =>
  probeData.map(probe => {
    const histogram = responseHistogramToGraphicFormat(probe.data[0].histogram);
    const { percentiles } = probe.data[0];
    const transformedPercentiles = Object.entries(percentiles).reduce(
      (acc, [bin, value]) => {
        acc[bin] = nearestBelow(
          value,
          histogram.map(h => h.bin)
        );
        return acc;
      },
      {}
    );
    return {
      label: probe.metadata[key],
      histogram,
      percentiles,
      transformedPercentiles,
      version: probe.metadata.version,
      audienceSize: probe.data[0].total_users
    };
  });

function toProportions(obj) {
  const proportions = { ...obj };
  const total = Object.values(proportions).reduce((a, b) => a + b, 0);
  Object.keys(proportions).forEach(p => {
    proportions[p] /= total;
  });
  return proportions;
}

export const prepareForProportionPlot = (
  probeData,
  key = "version",
  prepareArgs = {}
) =>
  probeData.map(probe => {
    const counts = { ...probe.data[0].histogram };
    if (prepareArgs.probeType === "histogram-boolean") {
      counts.no = counts["0"];
      counts.yes = counts["1"];
      delete counts["0"];
      delete counts["1"];
      delete counts["2"];
    }
    const proportions = toProportions(counts);
    return {
      label: probe.metadata[key],
      counts,
      version: probe.metadata.version,
      proportions,
      audienceSize: probe.data[0].total_users
    };
  });

export function isScalar(payload) {
  return payload.every(
    aggregation => aggregation.metadata.metric_type === "scalar"
  );
}

function sortByBuildID(a, b) {
  if (a.metadata.build_id < b.metadata.build_id) return -1;
  if (a.metadata.build_id >= b.metadata.build_id) return 1;
  return 0;
}

export function zipByAggregationType(payload) {
  // returns obj
  // keyed by aggwregation type, valued by [{data: [datum], metadata}, ...]
  const aggTypes = new Set([]);
  payload.forEach(aggregation => {
    aggregation.data.forEach(histogram => {
      const aggType = histogram.client_agg_type;
      aggTypes.add(aggType);
    });
  });

  const out = {};
  aggTypes.forEach(a => {
    out[a] = [];
  });

  payload.forEach(aggregation => {
    const { metadata } = aggregation;
    aggregation.data.forEach(datum => {
      const aggType = datum.client_agg_type;
      out[aggType].push({ data: datum, metadata });
    });
  });

  aggTypes.forEach(a => {
    out[a].sort(sortByBuildID);
  });
  return out;
}

function groupBy(xs, key, transform = _ => _) {
  return xs.reduce((rv, x) => {
    const K = transform(x[key]);
    (rv[K] = rv[K] || []).push(x);
    return rv;
  }, {});
}

export function topKBuildsPerDay(dataset, k = 2) {
  const byBuildID = groupBy(dataset, "label", buildID => buildID.slice(0, 8));
  // by buildID, return the top 2 of each.
  const topK = Object.entries(byBuildID).map(([_, matches]) => {
    const out = matches.filter(m => m.audienceSize > 10);
    out.sort(sortByKey("audienceSize"));
    out.reverse();
    return out.slice(0, k);
  });
  const flattened = topK.flat(2);
  flattened.sort(sortByKey("label"));
  return flattened;
}

export function gatherBy(payload, by) {
  const gathered = {};
  // get the entire set of keys.
  payload.forEach(aggregation => {
    aggregation.data.forEach(entry => {
      const aggType = by(entry);
      if (!(aggType in gathered)) gathered[aggType] = [];
      gathered[aggType].push({
        data: [entry],
        metadata: aggregation.metadata
      });
    });
  });
  return gathered;
}

export function byKeyAndAggregation(
  data,
  preparationType = "quantile",
  aggregationLevel = "build_id",
  prepareArgs = {},
  postProcessArgs = {}
) {
  const prepareFcn =
    preparationType === "quantile"
      ? prepareForQuantilePlot
      : prepareForProportionPlot;
  const byKey = gatherBy(data, entry => entry.key);
  Object.keys(byKey).forEach(k => {
    byKey[k] = gatherBy(byKey[k], entry => entry.client_agg_type);
    Object.keys(byKey[k]).forEach(aggKey => {
      byKey[k][aggKey] = prepareFcn(
        byKey[k][aggKey],
        aggregationLevel,
        prepareArgs
      );
      byKey[k][aggKey] = topKBuildsPerDay(byKey[k][aggKey], 2);
      byKey[k][aggKey].sort(sortByKey("label"));
      if (postProcessArgs.removeZeroes) {
        // go through byKey[k][aggKey] and delete counts and proportions that are always zero.
        const keys = Object.keys(byKey[k][aggKey][0].counts);
        const toRemove = keys
          .map(ki => [
            ki,
            byKey[k][aggKey].every(datum => datum.counts[ki] === 0.0)
          ])
          .filter(([ki, tf]) => tf)
          .map(([k]) => k);
        byKey[k][aggKey] = byKey[k][aggKey].map(datum =>
          produce(datum, draft => {
            toRemove.forEach(k => {
              delete draft.counts[k];
              delete draft.proportions[k];
            });
          })
        );
      }
    });
  });
  return byKey;
}

function typeAndKind(probeType, probeKind) {
  return (matchType, matchKind) =>
    probeType === matchType && probeKind === matchKind;
}

export function getProbeViewType(probeType, probeKind) {
  const m = typeAndKind(probeType, probeKind);
  // histogram blocks
  if (m("histogram", "linear")) return "histogram";
  if (m("histogram", "exponential")) return "histogram";
  // scalar (hist rep) blocks FIXME: maybe conflate w/ histogram
  if (m("scalar", "uint")) return "scalar";
  // categorical blocks
  if (m("histogram", "enumerated")) return "categorical";
  if (m("histogram", "categorical")) return "categorical";
  if (m("histogram", "flag")) return "categorical";
  if (m("histogram", "boolean")) return "categorical";
  if (m("histogram", "count")) return "categorical";
  return undefined;
}

export function clientCounts(arr) {
  return arr.map(a => ({ totalClients: a.audienceSize, label: a.label }));
}
