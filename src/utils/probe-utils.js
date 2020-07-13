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

export function clientCounts(arr) {
  return arr.map((a) => ({ totalClients: a.audienceSize, label: a.label }));
}

function uniques(d, k) {
  return Array.from(new Set(d.map((di) => di[k])));
}

export function gatherProbeKeys(d) {
  return uniques(d, 'metric_key');
}

export function gatherAggregationTypes(d) {
  return uniques(d, 'client_agg_type');
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
